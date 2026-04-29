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
Agent → system-created

# admin create doctor profile

Admin request → Auth middleware → Role check (admin) → Create User → Create Doctor profile
