import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export const handleIncomingCall = async (req, res) => {
  const twiml = new VoiceResponse();

  twiml.say(
    'Namaste, welcome to hospital assistant. Please tell me your requirement.',
  );

  twiml.gather({
    input: 'speech',
    action: '/api/twilio/process_speech',
    method: 'POST',
    speechTimeout: 'auto',
  });

  res.type('text/xml');
  res.send(twiml.toString());
};
