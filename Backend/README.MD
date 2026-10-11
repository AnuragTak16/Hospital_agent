# we prepare hospital agent for booking appointment and call response

# stage1 : we setup backend with express and mongoose

1. docter table
2. patient table
3. appointment table
4. Availability table

User speaks
↓
Speech-to-Text (STT) (Deepgram)
↓
Text → AI() (intent extraction)
↓
Backend API call
↓
Response text
↓
Text-to-Speech (TTS) (Deepgram)
↓
Audio response to user

Deepgram STT and TTS for voice call

twilio workflow

## when call start

User dials → Telecom network(PSTN) → Twilio receives call(signal from PSTN)
→ Twilio sends webhook → Your backend  
 → Backend responds(with instructions for next step) → Twilio executes(based on instructions)

## when call end

Call started → in-progress  
User hangs up → network signal → Twilio detects  
→ Twilio updates status  
→ Webhook sent to your backend

### user created

Patient → auto-created (via call)
Doctor → created by admin
Admin → created manually (once)
Agent → system-created 2

# admin create doctor profile

Admin request → Auth middleware → Role check (admin) → Create User → Create Doctor profile

# stage 2: we use groq for intent extraction and response generation

1. intent extraction
2. response generation

## intent extraction

User speaks
↓
Speech-to-Text (STT) (Deepgram)
↓
Text → AI() (intent extraction)
↓
Backend API call
↓
Response text
↓
Text-to-Speech (TTS) (Deepgram)
↓
Audio response to user

# we use service for intent extraction and booking

1. intentService.js
2. bookingService.js

# after this all we setup : Conversation + Interaction layer

1. twilio
2. deepgram

## Deepgram + Twilio call flow (implemented)

User dials → POST /api/voice
→ Deepgram TTS greeting (Play) + Record
→ POST /api/twilio/process_speech
→ Download recording (Twilio auth) → Deepgram STT
→ Groq intent → bookingService
→ Deepgram TTS confirmation → Play audio

Required env:
- DEEPGRAM_API_KEY
- PUBLIC_BASE_URL (reachable by Twilio, e.g. ngrok)
- TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN (to download recordings for STT)

Audio files are served at GET /api/twilio/audio/:filename
