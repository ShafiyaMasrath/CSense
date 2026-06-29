import json
import os
import base64
from datetime import datetime
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
from graph.graph import create_graph
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CSense – Intelligent Customer Success Action Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compiled LangGraph instance
graph = create_graph()

# Environment Extraction
RECALL_AI_API_KEY = os.getenv("RECALL_AI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ZOOM_ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID")
ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")

# Configure Gemini Analytics Engine
from ai_client import shared_model as gemini_model

# --- CORE FILE IO HELPER FUNCTIONS ---
def get_file_path(filename: str) -> str:
    return os.path.join(os.getcwd(), "data", filename)

def read_json_file(filename: str) -> list:
    path = get_file_path(filename)
    if not os.path.exists(path):
        path = os.path.join(os.getcwd(), "..", "backend", "data", filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json_file(filename: str, data: list):
    path = get_file_path(filename)
    if not os.path.exists(os.path.dirname(path)):
        path = os.path.join(os.getcwd(), "..", "backend", "data", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# --- REQUEST PAYLOAD COMPONENT MODELS ---
class AnalysisRequest(BaseModel):
    customer_id: str

class AcceptRecommendationRequest(BaseModel):
    customer_id: str
    recommendation_title: str
    csm_name: str

# --- ZOOM TWO-LEGGED SERVER-TO-SERVER OAUTH GENERATOR ---
async def get_zoom_access_token() -> str:
    if not all([ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET]):
        raise HTTPException(status_code=500, detail="Zoom Server App variables are missing from backend environment configurations.")
        
    token_credentials = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(token_credentials.encode()).decode()
    
    headers = {
        "Host": "zoom.us",
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    params = {
        "grant_type": "account_credentials",
        "account_id": ZOOM_ACCOUNT_ID
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post("https://zoom.us/oauth/token", headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed authenticating credentials with Zoom: {response.text}")
        return response.json().get("access_token")

# --- ROUTE 1: PIPELINE ENGINE ANALYZER (LANGGRAPH) ---
@app.post("/analyze/{customer_id}")
async def analyze_customer(customer_id: str):
    if not GOOGLE_API_KEY:
        return {
            "success": False,
            "error": "GOOGLE_API_KEY is missing from environment variables."
        }

    data_path = os.path.join(os.getcwd(), "data", "crm.json")
    if not os.path.exists(data_path):
        data_path = os.path.join(os.getcwd(), "..", "backend", "data", "crm.json")

    try:
        with open(data_path, 'r') as f:
            crm_data = json.load(f)
    except Exception as e:
        return {"success": False, "error": f"Error loading CRM data: {str(e)}"}

    customer = next((c for c in crm_data if c["id"] == customer_id), None)
    if not customer:
        return {"success": False, "error": "Customer not found"}

    initial_state = {
        "customer_id": customer_id,
        "customer_data": customer,
        "retrieved_context": {},
        "risk_analysis": {},
        "recommendations": [],
        "devil_review": {},
        "memory": {},
        "execution_plan": [],
        "execution_log": []
    }

    try:
        print("\n=========================")
        print("Analyze Request Started")
        print(f"Customer: {customer_id}\n")

        final_state = initial_state
        node_names = {
            "planner": "Planner Agent",
            "context": "Context Retrieval",
            "risk_analysis": "Risk Analysis",
            "recommendations": "Recommendation",
            "devil_advocate": "Devil's Advocate",
            "memory": "Memory"
        }

        for event in graph.stream(initial_state):
            for node, state_update in event.items():
                print(f"{node_names.get(node, node)} [OK]")
                final_state = state_update

        print("\nAnalyze Request Completed")
        print("=========================\n")

        return {
            "success": True,
            "risk_analysis": final_state.get("risk_analysis", {}),
            "recommendations": final_state.get("recommendations", []),
            "devil_review": final_state.get("devil_review", {}),
            "execution_log": final_state.get("execution_log", []),
            "retrieved_context": final_state.get("retrieved_context", {})
        }
    except Exception as e:
        import traceback
        print("\n=========================")
        print("Analyze Request Failed")
        print(f"Customer: {customer_id}\n")
        traceback.print_exc()
        print("=========================\n")
        return {
            "success": False,
            "error": f"Graph execution failed: {str(e)}"
        }

# --- ROUTE 2: STRATEGY WORKSPACE AUTOMATION RUNNER (ZOOM + RECALL REGIONAL) ---
@app.post("/accept-recommendation")
async def accept_recommendation(payload: AcceptRecommendationRequest):
    contacts = read_json_file("contacts.json")
    customer_contact = next((c for c in contacts if c["customer_id"] == payload.customer_id), None)
    
    if not customer_contact:
        raise HTTPException(status_code=404, detail="Customer contact matrix records not found")
        
    zoom_token = await get_zoom_access_token()
    
    zoom_headers = {
        "Authorization": f"Bearer {zoom_token}",
        "Content-Type": "application/json"
    }
    meeting_creation_body = {
        "topic": f"CSense Strategic Sync: {payload.recommendation_title}",
        "type": 1, 
        "settings": {
            "host_video": True,
            "participant_video": True,
            "join_before_host": True,
            "jbh_time": 0,
            "waiting_room": False,
            "mute_upon_entry": False
        }
    }
    
    async with httpx.AsyncClient() as client:
        zoom_response = await client.post("https://api.zoom.us/v2/users/me/meetings", headers=zoom_headers, json=meeting_creation_body)
        if zoom_response.status_code not in [200, 201]:
            raise HTTPException(status_code=400, detail=f"Zoom room provision execution encountered absolute errors: {zoom_response.text}")
            
        zoom_data = zoom_response.json()
        host_launch_link = zoom_data.get("start_url")      
        public_participant_link = zoom_data.get("join_url") 

    recipient_email = customer_contact.get("champion_email") or customer_contact.get("decision_maker_email") or "client@customer.com"
    recipient_name = customer_contact.get("champion") or customer_contact.get("decision_maker") or "Team"
    
    email_body = (
        f"Hi {recipient_name},\n\n"
        f"Following up regarding your operational context. I want to make sure we connect on an execution path "
        f"for: '{payload.recommendation_title}'.\n\n"
        f"I have scheduled a dedicated session for us. Please use this calendar entry bridge when joining:\n"
        f"Meeting Link: {public_participant_link}\n\n"
        f"Best Regards,\n{payload.csm_name}"
    )
    
    recall_bot_id = None
    if RECALL_AI_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                recall_response = await client.post(
                    "https://ap-northeast-1.recall.ai/api/v1/bot/",
                    headers={
                        "Authorization": f"Token {RECALL_AI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "meeting_url": public_participant_link,
                        "bot_name": "CSense Transcription System",
                        "recording_config": {
                            "transcript": {
                                "provider": {
                                    "recallai_streaming": {
                                        "mode": "prioritize_low_latency",
                                        "language_code": "en"
                                    }
                                }
                            }
                        },
                        "metadata": {
                            "customer_id": payload.customer_id,
                            "title": payload.recommendation_title
                        }
                    },
                    timeout=30.0
                )
                if recall_response.status_code in [200, 201]:
                    recall_bot_id = recall_response.json().get("id")
                    print(f"Recall Bot Dispatched Successfully! Bot ID: {recall_bot_id}")
                else:
                    print(f"Recall Bot Dispatch Failure Status Code {recall_response.status_code}: {recall_response.text}")
        except Exception as e:
            print(f"Recall.ai automation runner exception: {str(e)}")

    return {
        "status": "success",
        "meeting_link": host_launch_link,
        "recall_bot_id": recall_bot_id,
        "email_draft": {
            "to": recipient_email,
            "subject": f"Action Required: Alignment Workshop - {payload.recommendation_title}",
            "body": email_body
        }
    }

# --- ASYNC BACKGROUND PROCESSOR: RECALL WEBHOOK TRANSCRIPT PARSER ---
def process_transcript_and_update_file(customer_id: str, raw_transcript: list):
    try:
        compiled_transcript_text = "\n".join([
            f"{line.get('speaker', 'Unknown')}: {line.get('text', '')}" 
            for line in raw_transcript
        ])
        
        prompt = f"""
        You are an advanced Customer Success Analytics Engine. Parse the following transcription file payload.
        Extract a comprehensive summary, exact customer pain points, specific next step action items, and structural user sentiment.
        
        You must respond with a strictly valid JSON object adhering to this schema structure format:
        {{
          "summary": "Your derived short summary sentence strings",
          "action_items": ["Action item 1", "Action item 2"],
          "sentiment": "Positive/Neutral/Negative/Critical"
        }}
        
        TRANSCRIPT DATA TO EVALUATE:
        {compiled_transcript_text}
        """
        
        gemini_response = gemini_model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        parsed_analysis = json.loads(gemini_response.text)
        
        new_session_entry = {
            "date": datetime.today().strftime('%Y-%m-%d'),
            "summary": parsed_analysis.get("summary", "Session summary generated."),
            "action_items": parsed_analysis.get("action_items", []),
            "sentiment": parsed_analysis.get("sentiment", "Neutral")
        }
        
        meetings_data = read_json_file("meetings.json")
        customer_history_record = next((m for m in meetings_data if m["customer_id"] == customer_id), None)
        
        if customer_history_record:
            customer_history_record["history"].insert(0, new_session_entry)
        else:
            meetings_data.append({
                "customer_id": customer_id,
                "history": [new_session_entry]
            })
            
        write_json_file("meetings.json", meetings_data)
        print(f"File database updated successfully for target company: {customer_id}")
        
    except Exception as e:
        print(f"Critical data append failure inside background transaction thread worker: {str(e)}")

# @app.post("/webhooks/recall-meeting-ended")
# async def recall_meeting_ended_webhook(request: Request, background_tasks: BackgroundTasks):

#     payload = await request.json()
    
#     if payload.get("event") != "bot.done":
#         return {"status": "ignored"}
        
#     # FIX: Extract bot payload fields correctly based on the nested JSON schema template
#     data_block = payload.get("data", {})
#     bot_nested = data_block.get("bot", {})
    
#     bot_id = bot_nested.get("id")
#     metadata = bot_nested.get("metadata", {})
#     customer_id = metadata.get("customer_id")
    
#     # Fallback to keep your tests functional even if no metadata is sent in the mockup payload
#     if not customer_id:
#         print("Webhook test received successfully! (Skipping file ingestion due to missing mockup customer_id metadata)")
#         return {"status": "test_received_ok"}

#     async with httpx.AsyncClient() as client:
#         transcript_response = await client.get(
#             f"https://ap-northeast-1.recall.ai/api/v1/bot/{bot_id}/transcript", 
#             headers={"Authorization": f"Token {RECALL_AI_API_KEY}"}
#         )
#         if transcript_response.status_code != 200:
#             raise HTTPException(status_code=500, detail="Failed gathering transcript context stream lines from bot database matrix.")
#         raw_transcript_data = transcript_response.json()

#     background_tasks.add_task(process_transcript_and_update_file, customer_id, raw_transcript_data)
#     return {"status": "processing_queued"}
@app.post("/webhooks/recall-meeting-ended")
async def recall_meeting_ended_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    try:
        payload = await request.json()

        print("\n================ RECALL WEBHOOK RECEIVED ================\n")
        print(json.dumps(payload, indent=2))
        print("\n=========================================================\n")

        # Ignore unrelated webhook events
        if payload.get("event") != "bot.done":
            print(f"Ignored event: {payload.get('event')}")
            return {"status": "ignored"}

        # Extract payload
        data_block = payload.get("data", {})
        bot = data_block.get("bot", {})

        bot_id = bot.get("id")
        metadata = bot.get("metadata", {})

        customer_id = metadata.get("customer_id")
        title = metadata.get("title")

        print("Bot ID:", bot_id)
        print("Customer ID:", customer_id)
        print("Title:", title)
        print("Recall Key Exists:", bool(RECALL_AI_API_KEY))

        if not bot_id:
            raise HTTPException(
                status_code=400,
                detail="bot_id missing in webhook payload."
            )

        if not customer_id:
            return {
                "status": "customer_id_missing",
                "message": "Webhook received but metadata.customer_id not found."
            }

        transcript_url = f"https://ap-northeast-1.recall.ai/api/v1/bot/transcript/{bot_id}"

        print("\nFetching transcript...")
        print("URL:", transcript_url)

        async with httpx.AsyncClient(timeout=30.0) as client:
            transcript_response = await client.get(
                transcript_url,
                headers={
                    "Authorization": f"Token {RECALL_AI_API_KEY}"
                }
            )

        print("\n========== TRANSCRIPT RESPONSE ==========")
        print("Status Code:", transcript_response.status_code)
        print("Response Body:")
        print(transcript_response.text)
        print("=========================================\n")

        if transcript_response.status_code != 200:
            return {
                "status": "failed",
                "recall_status": transcript_response.status_code,
                "recall_response": transcript_response.text
            }

        raw_transcript = transcript_response.json()

        print("Transcript downloaded successfully.")

        background_tasks.add_task(
            process_transcript_and_update_file,
            customer_id,
            raw_transcript
        )

        print("Background task queued.")

        return {
            "status": "processing_queued",
            "customer_id": customer_id,
            "bot_id": bot_id
        }

    except Exception as e:
        import traceback

        print("\n============= WEBHOOK ERROR =============")
        traceback.print_exc()
        print("=========================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
