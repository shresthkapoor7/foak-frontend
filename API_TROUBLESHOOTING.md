# API Connection Troubleshooting

## CORS Issues

The most common issue when connecting to the backend API is CORS (Cross-Origin Resource Sharing) policy blocking requests from the frontend.

### Quick Solutions:

1. **Backend CORS Configuration** (Recommended)
   - Add the frontend domain to the backend's CORS allowed origins
   - For development: allow `http://localhost:3000`
   - For production: allow your deployed frontend domain

2. **CORS Proxy for Development** (Temporary)
   - In `src/services/apiService.ts`, set `USE_CORS_PROXY = true`
   - This routes requests through a CORS proxy service
   - Note: This is for development only, not production

3. **Browser Extensions** (Development Only)
   - Install "CORS Unblock" or similar browser extension
   - Enable it temporarily for development
   - Remember to disable for normal browsing

### Backend CORS Configuration Example:

```python
# For FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "https://your-frontend-domain.com"  # Production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Testing API Connection:

1. Open the sites page
2. If you see an error, click "🧪 Test API" button
3. Check the browser console for detailed error messages
4. Look at the Network tab to see the actual request/response

### Fallback Behavior:

- If the API fails, the app automatically falls back to sample data
- You'll see a warning message but the app continues to work
- All features (map, details, CSV, PDF, AI chat) work with sample data

### Current Status:

- ✅ API service implemented
- ✅ Error handling and fallback
- ✅ CORS proxy option available
- ⚠️ Backend CORS configuration needed for production
