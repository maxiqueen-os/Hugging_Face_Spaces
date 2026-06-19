# MaxiQueen OS v2 - Integración en Hugging Face Spaces

API de MaxiQueen desplegada en Hugging Face Spaces con soporte para MongoDB Atlas.

## 📋 Requisitos previos

- GitHub o GitLab (para conectar tu repositorio)
- Cuenta en [Hugging Face](https://huggingface.co)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (para persistencia de datos)
- Node.js 20+ (para desarrollo local)

## 🚀 Pasos de integración

### 1. **Obtener URI de MongoDB Atlas**

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster (gratis está disponible)
3. Ve a **Database** → **Clusters** → Click en tu cluster
4. Selecciona **"Connect"** → **"Drivers"** → **"Node.js"**
5. Copia la URI (se verá como: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/...`)

### 2. **Preparar tu repositorio local**

```bash
# Si aún no tienes git inicializado
git init
git add .
git commit -m "MaxiQueen OS v2 setup para Hugging Face Spaces"
```

Asegúrate de tener estos archivos:
```
tu-repo/
├── Dockerfile
├── package.json
├── index.js
├── .dockerignore
├── .env.example
├── README.md
└── public/
    └── index.html (opcional)
```

### 3. **Pushear a GitHub**

```bash
git remote add origin https://github.com/tu-usuario/maxiqueen-api.git
git branch -M main
git push -u origin main
```

### 4. **Crear Space en Hugging Face**

1. Ve a [https://huggingface.co/spaces](https://huggingface.co/spaces)
2. Click en **"Create new Space"**
3. Rellena:
   - **Space name**: `maxiqueen-api` (o tu nombre preferido)
   - **License**: MIT
   - **Space SDK**: **Docker** ⭐ (IMPORTANTE)
   - **Visibility**: Private o Public

### 5. **Conectar tu repositorio**

En la pestaña **Settings** del Space:
1. Ve a **Linked Repositories**
2. Selecciona tu repositorio de GitHub
3. ¡El Space se desplegará automáticamente!

### 6. **Agregar variables de entorno**

En **Settings** → **Variables and secrets**:
- **Nombre**: `MONGO_URI`
- **Valor**: Tu URI de MongoDB Atlas (ejemplo: `mongodb+srv://usuario:pass@cluster.mongodb.net/maxiqueen?retryWrites=true&w=majority`)
- Selecciona **"secret"** para que no sea visible

## 🧪 Probar localmente

### Con Docker:
```bash
# Crear archivo .env con tu MONGO_URI
echo "MONGO_URI=mongodb+srv://usuario:pass@..." > .env

# Construir imagen
docker build -t maxiqueen-api .

# Ejecutar
docker run -p 7860:7860 --env-file .env maxiqueen-api
```

### Sin Docker:
```bash
# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu MONGO_URI

# Instalar dependencias
npm install

# Ejecutar
npm start
# O modo desarrollo
npm run dev
```

Accede a `http://localhost:7860`

## 📡 Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Status del servidor |
| `GET` | `/health` | Health check |
| `GET` | `/api/db-status` | Verificar conexión MongoDB |
| `POST` | `/api/save` | Guardar datos en MongoDB |
| `GET` | `/api/get/:collection` | Obtener datos de MongoDB |

### Ejemplos de uso:

**Verificar servidor:**
```bash
curl http://localhost:7860/
```

**Verificar MongoDB:**
```bash
curl http://localhost:7860/api/db-status
```

**Guardar datos:**
```bash
curl -X POST http://localhost:7860/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "usuarios",
    "data": {"nombre": "MaxiQueen", "edad": 25}
  }'
```

**Obtener datos:**
```bash
curl http://localhost:7860/api/get/usuarios?limit=5
```

## 🔧 Agregar más endpoints

Abre `index.js` y agrega tus rutas:

```javascript
// Ejemplo: Nueva ruta para tu lógica IA
app.post('/api/predict', async (req, res) => {
    try {
        const { input } = req.body;
        
        // Tu lógica de IA aquí
        const result = await tuModeloIA(input);
        
        // Guardar en MongoDB (opcional)
        if (db) {
            await db.collection('predictions').insertOne({
                input,
                result,
                createdAt: new Date()
            });
        }
        
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

## 🐛 Solución de problemas

### "MongoDB connection timeout"
- Verifica que tu IP esté whitelisted en MongoDB Atlas
- En MongoDB Atlas: **Security** → **Network Access** → Agrega `0.0.0.0/0`
- Verifica que la URI sea correcta

### "Port 3000 or 4000 not found"
- El puerto DEBE ser **7860** en Hugging Face Spaces
- Ya está configurado en el `Dockerfile` y `index.js`

### Space no se despliega
- Revisa los logs en la pestaña **"Logs"** del Space
- Asegúrate de que `package.json` tiene todas las dependencias
- Verifica que el `Dockerfile` está correcto

### El Space está offline
- Hugging Face Spaces "duerme" después de 48 horas sin actividad
- Para mantenerlo activo: configura GitHub Actions o accede regularmente

## 📚 Recursos útiles

- [Docs Hugging Face Spaces](https://huggingface.co/docs/hub/spaces)
- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)
- [Express.js Docs](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)

## 🎯 Siguientes pasos

1. **Agregar más lógica**: Modifica `index.js` con tus endpoints
2. **Frontend**: Mejora `public/index.html` con tu interfaz
3. **Autenticación**: Agrega JWT o OAuth
4. **Validación**: Usa bibliotecas como `joi` o `zod`

---

¿Preguntas? Revisa los logs en Hugging Face Spaces o contacta al soporte 🚀

