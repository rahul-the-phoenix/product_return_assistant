# 🚀 QUICK SETUP GUIDE

## FINAL STEPS (ONLY THINGS YOU MUST DO)

### 1. Install Node.js
- Go to https://nodejs.org/
- Download the LTS (Long Term Support) version
- Run the installer
- Verify installation by opening terminal/command prompt and typing:
  ```
  node --version
  ```
  You should see something like: v18.x.x or v20.x.x

### 2. Prepare Your Workspace
- Open VS Code (or your preferred code editor)
- Create a new folder called `returns-bot` on your desktop or documents
- Copy ALL the project files into this folder

### 3. Open Terminal in VS Code
- In VS Code: Terminal → New Terminal
- Make sure you're in the `returns-bot` folder
- Type `pwd` (Mac/Linux) or `cd` (Windows) to verify

### 4. Install Dependencies
In the terminal, type:
```bash
npm install
```
Wait for it to finish (this downloads all required packages)

### 5. Configure Environment Variables
- Rename `.env.example` to `.env`
- Open the `.env` file
- Add your ScaleDown API key:
  ```
  SCALEDOWN_API_KEY=your_actual_scaledown_api_key_here
  PORT=3000
  ```
- If you don't have an API key, leave it as is - the system will use fallback compression

### 6. Start the Server
In the terminal, type:
```bash
npm start
```

You should see:
```
🚀 AI Returns Assistant running on http://localhost:3000
📊 Analytics: http://localhost:3000/analytics
💬 Chat interface ready!
```

### 7. Open in Browser
- Open your web browser (Chrome, Firefox, Safari, Edge)
- Go to: `http://localhost:3000`
- You should see the AI Returns Assistant interface!

### 8. Test the Application
Try these in the chat:
- "Can I return my order ORD-001?"
- "Generate a return label for ORD-002"
- "What's my refund status for ORD-001?"
- "I want to exchange my item"

---

## 🆘 Troubleshooting

### Problem: "npm: command not found"
**Solution**: Node.js is not installed. Go back to step 1.

### Problem: Port 3000 already in use
**Solution**: 
- Change PORT in .env file to 3001 or 3002
- Or close other applications using port 3000

### Problem: Module not found errors
**Solution**: Run `npm install` again

### Problem: Can't access localhost:3000
**Solution**: 
- Make sure server is running (check terminal)
- Try `http://127.0.0.1:3000` instead
- Check firewall settings

### Problem: ScaleDown API errors
**Solution**: The system will automatically use fallback compression - this is normal!

---

## 📝 Important Notes

- **Keep the terminal open** while using the app
- Press `Ctrl+C` in terminal to stop the server
- Run `npm start` again to restart
- Changes to code require server restart

---

## 🎯 For the Hackathon Demo

1. Make sure server is running before presenting
2. Have browser tab already open to localhost:3000
3. Test all features once before demo starts
4. Keep the README.md open for reference
5. Show analytics dashboard and fraud detection
6. Explain ScaleDown API benefits

---

## ✅ Checklist Before Demo

- [ ] Node.js installed
- [ ] All dependencies installed (`npm install` completed)
- [ ] Server starts without errors
- [ ] Can access localhost:3000 in browser
- [ ] Chat responds to messages
- [ ] Order lookup works
- [ ] Analytics dashboard loads
- [ ] Prepared demo script ready

---

## 🎉 You're Ready!

If all steps worked, your AI Returns Assistant is ready for the hackathon!

Good luck! 🚀
