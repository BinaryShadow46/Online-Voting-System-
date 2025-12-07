# SecureVote - Online Voting System PWA

A fully functional, responsive Progressive Web App for secure online voting. Works entirely on GitHub Pages via smartphone.

## Features

### 🗳️ **Voting System**
- Secure ballot casting
- Multiple election support
- Real-time vote counting
- Candidate selection with images

### 📱 **PWA Capabilities**
- Installable on smartphone home screen
- Works offline
- Push notifications
- Background sync

### 🎨 **UI/UX Features**
- Fully responsive design
- Dark/light mode toggle
- Live results with charts
- Real-time statistics dashboard
- Smooth animations

### 🔒 **Security Features**
- Local data encryption
- Vote verification
- Duplicate vote prevention
- Offline capability

## Setup Instructions

### **Option A: Direct GitHub Upload**
1. Create new repository on GitHub.com
2. Upload all 5 files:
   - `index.html`
   - `app.js`
   - `manifest.json`
   - `service-worker.js`
   - `README.md`
3. Enable GitHub Pages in Settings
4. Access at: `https://username.github.io/repository-name/`

### **Option B: GitHub Desktop**
1. Clone repository to your computer
2. Add all files to the repository
3. Commit and push to GitHub
4. Enable GitHub Pages

## Usage Guide

### **For Voters:**
1. Open the PWA on your smartphone
2. Register/Login (data stored locally)
3. Browse available elections
4. Select candidate and cast vote
5. View live results

### **For Admins:**
1. Access Admin Panel
2. Create new elections
3. Add candidates with images
4. Set election deadlines
5. Monitor live results

## Technical Details

### **Technologies Used:**
- HTML5, CSS3, JavaScript (ES6+)
- IndexedDB for local storage
- Chart.js for data visualization
- Service Workers for offline capability
- Web App Manifest for PWA

### **Browser Support:**
- Chrome 50+
- Firefox 48+
- Safari 11.1+
- Edge 79+

### **Storage:**
- LocalStorage for user preferences
- IndexedDB for votes and elections
- Cache API for offline assets

## Privacy & Security

### **Data Protection:**
- All data stays on user's device
- No external data transmission
- Encrypted local storage
- Secure vote casting mechanism

### **Features:**
- No account required
- Anonymous voting option
- Vote verification system
- Tamper-proof vote counting

## Deployment Options

### **Free Hosting:**
1. **GitHub Pages** (Recommended)
2. **Netlify**
3. **Vercel**
4. **Firebase Hosting**

### **Custom Domain:**
1. Add CNAME file to repository
2. Configure DNS settings
3. Update manifest.json start_url

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check GitHub Issues
2. Create new issue
3. Contact via repository

---

**Note:** This is a frontend-only demo. For production use, implement backend API for vote storage and verification.
