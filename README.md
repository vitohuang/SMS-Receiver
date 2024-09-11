# SMS Receiver Cloudflare Worker

## Purpose
This project is a Cloudflare Worker that receives SMS messages sent from remote callers and saves them into a database for later retrieval.
The andriod app for sending SMS to any http server can be found at https://github.com/vitohuang/sms-pusher

## Features
- Receive SMS messages via HTTP requests.
- Store messages in a database.
- Retrieve stored messages for lookup.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables (e.g., database connection details).

4. Deploy to Cloudflare Workers:
   ```bash
   wrangler publish
   ```

## Setting Up Cloudflare Worker and KV
1. **Create a Cloudflare Account**: If you don't have one, sign up at [Cloudflare](https://www.cloudflare.com/).

2. **Create a New Worker**:
   - Go to the Cloudflare dashboard.
   - Select "Workers" from the sidebar.
   - Click on "Create a Service" and follow the prompts.

3. **Set Up Workers KV**:
   - In the Workers dashboard, navigate to "KV" under the "Workers" section.
   - Click on "Create a Namespace" and give it a name (e.g., `SMSMessages`).
   - Note the namespace ID, as you'll need it for your environment variables.

4. **Configure Environment Variables**:
   - In your project, create a `.env` file or set environment variables directly in the Cloudflare dashboard.
   - Add your KV namespace ID and any other necessary configuration (e.g., database connection details).

5. **Deploy to Cloudflare Workers**:
   ```bash
   wrangler publish
   ```

## Usage Example
To send an SMS message to the worker, make a POST request to the worker's endpoint with the message data:

```bash
curl -X POST https://your-worker-url.com \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "+1234567890",
       "message": "Hello, this is a test message!"
     }'

```

## License
This project is licensed under the MIT License.
