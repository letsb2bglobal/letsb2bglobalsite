# Frontend Integration: Threaded Enquiry System (v2)

This document explains how to integrate the new threaded enquiry system.

## 1. Concepts
- **Thread**: The conversation container. Displayed in the "Inbox".
- **Message**: Individual chats within a thread.
- **Participant**: Your profile's link to a thread (manages unread counts).

---

## 2. API Endpoints

### 2.1 Fetching the Inbox (Thread List)
Retrieve conversations the current user is participating in. 
**Note:** The backend automatically filters these to only show threads where YOU are a participant.

**Endpoint:** `GET /api/enquiry-threads`

**CURL Example:**
```bash
curl -X GET "https://api.letsb2b.com/api/enquiry-threads?populate[from_company][fields][0]=company_name&populate[to_company][fields][0]=company_name&sort=last_message_at:desc" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2.2 Starting a New Enquiry (Create Thread)
Initialize a thread. This automatically makes you the "Owner" and the target company a "Participant".

**Endpoint:** `POST /api/enquiry-threads`

**CURL Example:**
```bash
curl -X POST "https://api.letsb2b.com/api/enquiry-threads" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "data": {
         "title": "Inquiry for 50 AC Rooms",
         "to_company": "TARGET_COMPANY_DOCUMENT_ID",
         "thread_type": "enquiry"
       }
     }'
```

### 2.3 Send a Text Message (Reply)
Send a simple text reply to an existing thread.

**Endpoint:** `POST /api/enquiry-messages`

**CURL Example:**
```bash
curl -X POST "https://api.letsb2b.com/api/enquiry-messages" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "data": {
         "thread": "THREAD_DOCUMENT_ID",
         "message_body": "Looking for dates between 20-25th March."
       }
     }'
```

### 2.4 Send Binary Media (Photos, PDF, Video, etc.)
To send files (binary), use the dedicated upload endpoint.

**Endpoint:** `POST /api/enquiry-messages/upload`

**CURL Example:**
```bash
curl -X POST "https://api.letsb2b.com/api/enquiry-messages/upload" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F 'data={"thread": "THREAD_DOCUMENT_ID", "message_body": "PFA the room layout"}' \
     -F 'files=@/path/to/your/file.pdf'
```

---

## 3. Loading Conversation History
Fetch messages for a specific thread with pagination.

**Endpoint:** `GET /api/enquiry-messages`

**CURL Example:**
```bash
curl -X GET "https://api.letsb2b.com/api/enquiry-messages?filters[thread][documentId][$eq]=THREAD_ID&populate[sender_profile][fields][0]=full_name&pagination[page]=1&pagination[pageSize]=30&sort=createdAt:asc" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Security & Logic
1.  **Auto-Sender**: You DO NOT need to pass `sender_profile`. The backend identifies you via your JWT.
2.  **Auto-Filter**: `GET /api/enquiry-threads` is pre-filtered. You don't need to specify `fromUserId` or `toUserId`.
3.  **Forbidden**: If you are not a participant in a thread, the API will return `403 Forbidden`.
4.  **Snapshots**: Use `last_message_preview` from the thread object to show inbox snippets instantly.
