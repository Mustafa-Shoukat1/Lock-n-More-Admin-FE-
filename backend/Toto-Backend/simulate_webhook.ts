import axios from 'axios';

const PORT = 5001;
const WEBHOOK_URL = `http://localhost:${PORT}/whatsapp/webhook`;

const samplePayload = {
    object: "whatsapp_business_account",
    entry: [
        {
            id: "1133411658926546",
            changes: [
                {
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "1234567890",
                            phone_number_id: "832754373256676"
                        },
                        contacts: [
                            {
                                profile: {
                                    name: "Test User"
                                },
                                wa_id: "923151710347" // Matching the phone in your screenshot/logs
                            }
                        ],
                        messages: [
                            {
                                from: "923151710347",
                                id: "wamid.HBgM" + Date.now(), // Unique ID
                                timestamp: Math.floor(Date.now() / 1000),
                                text: {
                                    body: "This is a simulated local message! " + new Date().toLocaleTimeString()
                                },
                                type: "text"
                            },
                            {
                                from: "923151710347",
                                id: "wamid.AUDIO" + Date.now(),
                                timestamp: Math.floor(Date.now() / 1000),
                                type: "audio",
                                audio: {
                                    id: "media-id-audio-123",
                                    mime_type: "audio/ogg"
                                }
                            },
                            {
                                from: "923151710347",
                                id: "wamid.VIDEO" + Date.now(),
                                timestamp: Math.floor(Date.now() / 1000),
                                type: "video",
                                video: {
                                    id: "media-id-video-123",
                                    mime_type: "video/mp4",
                                    caption: "Cool video"
                                }
                            }
                        ]
                    },
                    field: "messages"
                }
            ]
        }
    ]
};

const simulateWebhook = async () => {
    try {
        console.log(`🚀 Sending simulated webhook to ${WEBHOOK_URL}...`);
        const response = await axios.post(WEBHOOK_URL, samplePayload);
        console.log(`✅ Status: ${response.status} ${response.statusText}`);
        console.log('👉 Check your backend terminal for logs and your Frontend UI for the new message.');
    } catch (error: any) {
        console.error('❌ Error sending webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

simulateWebhook();
