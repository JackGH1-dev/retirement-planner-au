# 🚀 Quick Start Guide - Optimise Retirement Planner

## **Step 1: Install Dependencies**

Open your terminal/command prompt and navigate to the project folder:

```bash
cd "C:\Users\encou\Documents\Project MicroSass\Optimise"
npm install
```

This will install all required dependencies (React, TypeScript, Tailwind CSS, etc.)

## **Step 2: Start the Development Server**

After dependencies are installed, run:

```bash
npm run dev
```

This will:
- Start the Vite development server
- Open your browser automatically to `http://localhost:3000`
- Enable hot reloading for instant updates

## **Step 3: View the Application**

The app has two main pages:

### **Landing Page** (`http://localhost:3000/`)
- Welcome page with feature overview
- "Get Started" button to access the planner

### **Planner Demo** (`http://localhost:3000/planner`)
- **4-Step Wizard Interface:**
  1. **Set Goals**: Age, retirement age, target income
  2. **Current Situation**: Salary, super balance, investments
  3. **Investment Strategy**: Auto-selected strategies 
  4. **Results**: Projected assets and retirement income

## **What You'll See**

### **🎯 Core Features Demonstrated:**
- **Beginner-friendly interface** with plain language
- **Australian context** (super, salary packaging)
- **Real-time calculations** as you change inputs
- **Visual progress tracking** through the 4 steps
- **Actionable results** with specific next steps

### **📊 Sample Calculation:**
With default inputs:
- 30 years old, retiring at 65 (35 years to save)
- $75,000 salary, $50,000 current super
- $1,000/month additional investments
- **Result**: ~$1.25M total assets, ~$4,200/month retirement income

### **🏗️ Technical Features:**
- **Responsive design** - works on mobile, tablet, desktop
- **Type-safe** - Built with TypeScript
- **Modern UI** - Tailwind CSS styling
- **Fast loading** - Vite build system
- **Error handling** - Graceful error boundaries

## **Alternative: Using npm/yarn directly**

If the automatic browser opening doesn't work:

```bash
# Option 1: npm
npm run dev

# Option 2: yarn (if you have it)
yarn dev

# Then manually open: http://localhost:3000
```

## **Project Structure**

```
src/
├── pages/
│   ├── Landing.tsx          # Homepage
│   └── PlannerDemo.tsx      # Main planner (simplified demo)
├── components/              # Full component library (50+ components)
│   └── ui/                  # UI components
├── contexts/                # React contexts (Auth, Settings)
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
├── utils/                   # Analytics & accessibility utilities
└── styles/                  # CSS files
```

## **Full vs Demo Version**

### **Currently Running: Demo Version**
- Simplified 4-step wizard
- Basic calculations
- Core UI/UX patterns
- ~500 lines of code

### **Full Version Available:**
- 50+ React components
- Advanced simulation engine with Web Workers
- Complete accessibility features
- Firebase integration
- Analytics tracking
- ~5000+ lines of production-ready code

**To switch to full version:**
Change `PlannerDemo` back to `Planner` in `src/App.tsx`

## **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## **Browser Requirements**

- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+)
- **JavaScript enabled**
- **Local storage support** (for settings persistence)

## **Troubleshooting**

### **Port 3000 in use:**
The app will automatically find the next available port (3001, 3002, etc.)

### **Dependencies won't install:**
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### **TypeScript errors:**
Run type checking:
```bash
npm run typecheck
```

### **Build fails:**
Check for unused imports:
```bash
npm run lint
```

## **🎉 You're Ready!**

The retirement planner should now be running at `http://localhost:3000`

**Try it out:**
1. Click "Get Started" or "Start Planning Free"
2. Go through the 4-step wizard
3. See your personalized retirement projection
4. Adjust the inputs to see how they affect your results

**This demonstrates the core MVP functionality of a beginner-friendly Australian retirement planning tool!** 🚀

---

**Need Help?** The full implementation includes detailed documentation, error handling, and production deployment guides.