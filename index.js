const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 7860;

// Middlewares - Configuración de CORS total para evitar bloqueos con Vercel
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static('public')); 

// Variables globales
let mongoClient = null;
let db = null;
let genAI = null;

// Inicializar la API de Gemini de Google
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        console.log('✅ SDK de Gemini IA inicializado correctamente');
    } catch (err) {
        console.error('❌ Error al inicializar Gemini:', err.message);
    }
} else {
    console.log('⚠️ Warning: No se encontró GEMINI_API_KEY en las variables de entorno.');
}

// Ruta base para comprobar que el contenedor responda en la web
app.get('/', (req, res) => {
    res.json({ 
        status: "online", 
        message: "MaxiQueen OS v2 API corriendo correctamente",
        version: "2.0.0",
        port: PORT,
        mongoConnected: mongoClient ? true : false,
        geminiReady: genAI ? true : false
    });
});

// Health check endpoint (Obligatorio para que Hugging Face Spaces no marque error)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString()
    });
});

// 🔥 RUTA CENTRALIZADA PARA EL CHAT DE LA IA
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        if (!genAI) {
            return res.status(503).json({ error: 'El servicio de IA no está configurado en el servidor.' });
        }

        // Configuración del modelo de lenguaje
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                systemInstruction: "Eres MaxiQueen AI, un sistema operativo con inteligencia integrada enfocado en automatización de ventas y estrategias digitales de manera profesional."
            }
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const reply = response.text() || "No se pudo obtener una respuesta válida.";

        // Si tu MongoDB Atlas está enlazado correctamente, guarda el registro automáticamente
        if (db) {
            db.collection('chat_logs').insertOne({
                prompt: message,
                response: reply,
                timestamp: new Date()
            }).catch(e => console.error("Error guardando log en BD:", e.message));
        }

        res.json({ success: true, response: reply });

    } catch (err) {
        console.error('❌ Error en el endpoint /api/chat:', err);
        res.status(500).json({ error: 'Error interno procesando la solicitud de IA.', details: err.message });
    }
});

// Configuración y conexión de MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function connectMongoDB() {
    if (mongoUri) {
        try {
            mongoClient = new MongoClient(mongoUri);
            await mongoClient.connect();
            db = mongoClient.db();
            console.log('✅ Conectado exitosamente a MongoDB Atlas');
            return true;
        } catch (err) {
            console.error('❌ Error al conectar a MongoDB:', err.message);
            return false;
        }
    } else {
        console.log('⚠️ Warning: No se detectó MONGO_URI. Trabajando en modo sin persistencia de datos.');
        return false;
    }
}

// Manejo universal de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Inicializar Servidor Completo
async function startServer() {
    await connectMongoDB();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`=============================================`);
        console.log(`🚀 Servidor de MaxiQueen activo en el puerto: ${PORT}`);
        console.log(`=============================================`);
    });
}

// Cierre limpio de procesos (Graceful shutdown)
process.on('SIGTERM', async () => {
    if (mongoClient) await mongoClient.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    if (mongoClient) await mongoClient.close();
    process.exit(0);
});

startServer().catch(err => {
    console.error('Error fatal al iniciar el servidor:', err);
    process.exit(1);
});