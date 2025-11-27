# Advanced Premium Blogging Platform

A professional, full-featured blogging platform built with modern web technologies. Perfect for content creators, bloggers, and digital publications.

## 🌟 Key Features

### Content Management
- **Rich Content Editor**: Write and publish articles with Markdown support
- **SEO Optimization**: Built-in SEO fields for better search engine visibility
- **Draft & Publish**: Save drafts and publish when ready
- **Premium Content**: Flag articles as premium for subscribers only
- **Reading Time**: Automatic reading time calculation
- **Categories & Tags**: Organize content effectively

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Search**: Full-text search across all content
- **Bookmarks**: Save articles for later reading
- **Comments**: Engage with readers through threaded comments
- **Social Sharing**: Share articles easily

### Monetization
- **Subscription Tiers**: Free, Premium ($9.99/mo), Creator ($29.99/mo)
- **Stripe Integration**: Secure payment processing
- **Premium Content**: Paywall for exclusive articles
- **Subscription Management**: Automatic renewal and tracking

### Analytics
- **Performance Dashboard**: Track views, likes, and engagement
- **Post Analytics**: Detailed metrics for each article
- **Reader Insights**: Understand your audience

### Email Marketing
- **Newsletter Subscriptions**: Build your email list
- **Subscriber Management**: Track active subscribers
- **Email Collection**: GDPR-compliant signup forms

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account (for payments)
- Google Cloud Console project (for SSO)

### Installation

1. **Clone and Install**
```bash
cd /workspace/app-7u8myi0s1fcx
pnpm install
```

2. **Configure Environment**
The `.env` file is already configured with Supabase credentials.

3. **Set Up Stripe** (Optional, for payments)
- Get your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/)
- Add to Supabase secrets: `STRIPE_SECRET_KEY=sk_test_...`
- See `STRIPE_SETUP.md` for detailed instructions

4. **Run Development Server**
```bash
pnpm run dev
```

## 👥 User Roles

### Guest
- Read free articles
- Browse categories
- Search content

### Subscriber
- All guest features
- Access premium content
- Comment on posts
- Bookmark articles
- Follow creators

### Creator
- All subscriber features
- Create and publish articles
- View analytics dashboard
- Manage own content

### Admin
- All creator features
- Manage all content
- Moderate comments
- Manage users

## 📱 Pages & Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Homepage with featured posts | Public |
| `/explore` | Browse all content | Public |
| `/search` | Search articles | Public |
| `/pricing` | Subscription plans | Public |
| `/newsletter` | Newsletter signup | Public |
| `/post/:slug` | Individual article view | Public/Premium |
| `/create` | Create new post | Creator/Admin |
| `/analytics` | Analytics dashboard | Creator/Admin |
| `/login` | Google SSO login | Public |
| `/payment-success` | Payment confirmation | Authenticated |

## 🎨 Design System

### Colors
- **Primary**: Deep Blue (#1E40AF) - Trust and professionalism
- **Secondary**: Vibrant Orange (#F97316) - Energy and creativity
- **Background**: White/Dark - Adaptive theme
- **Text**: Dark Gray/Light Gray - Optimal readability

### Typography
- Clean sans-serif fonts
- Responsive font sizes
- Proper hierarchy

### Components
- Built with shadcn/ui
- Consistent design language
- Accessible and responsive

## 🔒 Security

- **Authentication**: Google SSO via Supabase Auth
- **Authorization**: Row Level Security (RLS) policies
- **Payment Security**: PCI-compliant via Stripe
- **Data Protection**: Encrypted at rest and in transit
- **HTTPS**: All connections encrypted

## 📊 Database Schema

### Core Tables
- `profiles` - User accounts and settings
- `posts` - Article content and metadata
- `categories` - Content organization
- `tags` - Content tagging
- `comments` - User comments
- `likes` - Post likes
- `bookmarks` - Saved articles
- `follows` - User following
- `subscriptions` - Subscription tracking
- `orders` - Payment records
- `newsletter_subscribers` - Email list
- `post_analytics` - Performance metrics

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe
- **Routing**: React Router v6
- **State**: React Context + Hooks
- **Icons**: Lucide React
- **Dates**: date-fns
- **Notifications**: Sonner

## 📈 Analytics Features

### Creator Dashboard
- Total views across all posts
- Total likes and engagement
- Comment count
- Post performance breakdown
- Engagement metrics

### Post Metrics
- View count
- Like count
- Comment count
- Bookmark count
- Share count

## 💳 Payment Integration

### Subscription Tiers

**Free** - $0/month
- Read unlimited free articles
- Comment on posts
- Bookmark articles
- Follow creators
- Basic search

**Premium** - $9.99/month
- Everything in Free
- Access to premium content
- Ad-free reading
- Advanced search
- Download articles
- Priority support

**Creator** - $29.99/month
- Everything in Premium
- Publish unlimited articles
- Analytics dashboard
- Monetization tools
- Custom author page
- Newsletter integration

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry and any 3-digit CVC

## 🔧 Configuration

### First User Setup
1. Visit the application
2. Click "Sign In" and authenticate with Google
3. First user automatically becomes admin
4. Admin can promote other users to creator role

### Stripe Configuration
1. Create Stripe account
2. Get API keys from dashboard
3. Add `STRIPE_SECRET_KEY` to Supabase secrets
4. Test with test cards
5. Switch to live keys for production

## 📝 Content Creation Workflow

1. **Sign In**: Authenticate with Google
2. **Create Post**: Click "Write" in header
3. **Add Content**: 
   - Enter title (auto-generates slug)
   - Write content (Markdown supported)
   - Add excerpt and cover image
   - Set SEO fields
   - Mark as premium if needed
4. **Save Draft**: Save for later editing
5. **Publish**: Make live immediately
6. **Track Performance**: View analytics dashboard

## 🎯 Best Practices

### Content
- Use clear, engaging headlines
- Break content into sections
- Add relevant images
- Optimize for SEO
- Proofread before publishing

### SEO
- Write descriptive titles
- Add meta descriptions
- Use relevant keywords
- Include alt text for images
- Create unique slugs

### Engagement
- Respond to comments
- Share on social media
- Build email list
- Create premium content
- Analyze performance

## 🐛 Troubleshooting

### Login Issues
- Ensure Google SSO is configured
- Check browser cookies are enabled
- Clear cache and try again

### Payment Issues
- Verify Stripe keys are set
- Check test mode vs live mode
- Review Stripe dashboard for errors

### Content Issues
- Ensure user has creator role
- Check post status (draft vs published)
- Verify slug is unique

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review `STRIPE_SETUP.md` for payment issues
3. Check `TODO.md` for feature status
4. Review Supabase logs for errors

## 🚀 Deployment

The platform is production-ready with:
- ✅ Secure authentication
- ✅ Database with RLS policies
- ✅ Payment processing
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Dark mode support
- ✅ SEO optimization

## 📄 License

This project is built for professional use. All rights reserved.

---

**Built with ❤️ using React, TypeScript, Supabase, and Stripe**
