import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  Menu, 
  X,
  Star,
  Quote,
  Car,
  Bike,
  Home,
  Map,
  Compass,
  Users,
  LogOut,
  LogIn,
  User as UserIcon,
  ShieldAlert,
  CreditCard,
  Wallet,
  Banknote,
  ArrowLeft,
  Calendar,
  Truck,
  Building,
  Navigation
} from "lucide-react";
import { useState, useEffect, createContext, useContext, ReactNode, Component, ErrorInfo } from "react";
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: any;
  }
}

// --- Constants & Data ---

const WHATSAPP_NUMBER = "916003410721";
const WHATSAPP_LINK = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const LOGO_URL = "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/10000847592786840571141911842.png";

const DESTINATIONS = [
  {
    id: "assam",
    name: "Assam",
    shortDesc: "Tea gardens, wildlife, and the mighty Brahmaputra River.",
    fullDesc: "Assam is known for its vast tea plantations, rich wildlife, and vibrant culture. It is home to Kaziranga National Park, famous for the one-horned rhinoceros, and the mighty Brahmaputra River that flows through the state. Visitors can experience river cruises, wildlife safaris, and the peaceful beauty of tea estates.",
    highlights: ["Kaziranga National Park", "Brahmaputra River Cruise", "Tea Gardens"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/wp-17741730106632395861290139781464.jpg"
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    shortDesc: "Waterfalls, caves, and living root bridges.",
    fullDesc: "Meghalaya, known as the 'abode of clouds,' is famous for its lush green landscapes, waterfalls, and unique living root bridges. Cherrapunji and Mawsynram are among the wettest places on Earth. The state offers breathtaking views, caves, and serene hill towns like Shillong.",
    highlights: ["Living Root Bridges", "Cherrapunji Waterfalls", "Shillong"],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    shortDesc: "Snow mountains, monasteries, and untouched beauty.",
    fullDesc: "Arunachal Pradesh is a land of snow-capped mountains, peaceful monasteries, and untouched natural beauty. Tawang is one of the most popular destinations, known for its monastery and scenic landscapes. The region offers high-altitude passes, lakes, and a spiritual travel experience.",
    highlights: ["Tawang Monastery", "Sela Pass", "Snow Landscapes"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/premium_photo-1661880922509-7db62ae56442513614766962164307.jpg"
  },
  {
    id: "nagaland",
    name: "Nagaland",
    shortDesc: "Tribal culture and scenic green hills.",
    fullDesc: "Nagaland is known for its rich tribal heritage, colorful festivals, and scenic hills. The Hornbill Festival showcases the culture and traditions of various tribes. The state offers a unique blend of cultural experiences and natural beauty.",
    highlights: ["Hornbill Festival", "Tribal Villages", "Scenic Hills"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/2a3c9d276b5b7d88ff237a490769fa4f4056147869040205549.jpg"
  },
  {
    id: "manipur",
    name: "Manipur",
    shortDesc: "Loktak Lake and vibrant traditions.",
    fullDesc: "Manipur is home to Loktak Lake, the only floating lake in the world, known for its unique phumdis (floating islands). The state also has a rich cultural heritage, classical dance forms, and beautiful valleys surrounded by hills.",
    highlights: ["Loktak Lake", "Floating Islands", "Cultural Dance"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/c81961596644cdddfbd29af2eb102e3d1372306018691060673.jpg"
  },
  {
    id: "mizoram",
    name: "Mizoram",
    shortDesc: "Peaceful hills and fresh landscapes.",
    fullDesc: "Mizoram is known for its peaceful environment, rolling hills, and scenic beauty. It offers a calm and refreshing travel experience with clean surroundings and a unique local culture.",
    highlights: ["Lush Green Hills", "Peaceful Environment", "Scenic Views"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/02e2f60916a120be2ad29aabf7eeeb1d7399469827617193571.jpg"
  },
  {
    id: "tripura",
    name: "Tripura",
    shortDesc: "Temples, palaces, and hidden gems.",
    fullDesc: "Tripura is rich in history and culture, featuring beautiful temples, royal palaces like Ujjayanta Palace, and natural beauty. It is one of the lesser-explored gems of Northeast India.",
    highlights: ["Ujjayanta Palace", "Temples", "Natural Landscapes"],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/photo-1660541545929-ccabfc764c993891344570044540894.jpg"
  }
];

const SERVICES = [
  {
    title: "Customized Tour Packages",
    desc: "Tailor-made itineraries that match your pace, interests, and budget.",
    icon: <Map className="w-6 h-6" />
  },
  {
    title: "Taxi Booking Services",
    desc: "Reliable local drivers and well-maintained vehicles for a smooth ride.",
    icon: <Car className="w-6 h-6" />
  },
  {
    title: "Self-Drive Car Rentals",
    desc: "Freedom to explore at your own will with our premium self-drive fleet.",
    icon: <Compass className="w-6 h-6" />
  },
  {
    title: "Bike Rentals",
    desc: "For the adventurers who want to feel the Himalayan wind on two wheels.",
    icon: <Bike className="w-6 h-6" />
  },
  {
    title: "Homestay Booking",
    desc: "Experience authentic local hospitality in handpicked cozy homestays.",
    icon: <Home className="w-6 h-6" />
  }
];

const PACKAGES = [
  {
    title: "Assam + Meghalaya Discovery",
    duration: "4–5 Days",
    price: "₹7,999",
    features: [
      "Guwahati → Shillong → Cherrapunji",
      "Kaziranga Wildlife & Tea Gardens",
      "Living Root Bridges & Waterfalls",
      "Brahmaputra River Cruise"
    ],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Tawang Arunachal Expedition",
    duration: "5–7 Days",
    price: "₹12,999",
    features: [
      "Guwahati → Bhalukpong → Bomdila",
      "Tawang Monastery & War Memorial",
      "Sela Pass Snow & Alpine Lakes",
      "Himalayan Sunrise Views"
    ],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/d5c893992347caa84f6de0b7aca0ef546260489156362462819.jpg"
  },
  {
    title: "Custom Northeast Road Trip",
    duration: "Flexible",
    price: "₹5,000",
    features: [
      "Choose states & duration",
      "Car/Bike included",
      "Homestays arranged",
      "Local support"
    ],
    image: "https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/saveclip4755437319339636653.jpg"
  }
];

const REVIEWS = [
  {
    name: "Rahul Sharma",
    location: "Delhi",
    text: "Our trip to Meghalaya was flawlessly organized. The local insights provided by Ojaantric Jajabor made all the difference. Highly recommended!",
    trip: "Meghalaya Discovery"
  },
  {
    name: "Priya Nair",
    location: "Bengaluru",
    text: "Tawang was a dream come true. The driver was professional and the homestays were so warm and welcoming. Truly a premium experience.",
    trip: "Arunachal Expedition"
  },
  {
    name: "Arun & Kavya",
    location: "Chennai",
    text: "We opted for a custom road trip across Assam and Nagaland. Everything from the bike rental to the route planning was perfect.",
    trip: "Custom Road Trip"
  },
  {
    name: "Sneha Gogoi",
    location: "Assam",
    text: "As a local, I was impressed by their depth of knowledge about the hidden gems. They really know the Northeast like no one else.",
    trip: "Kaziranga Safari"
  }
];

// --- Contexts & Providers ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-nature-white p-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-primary mb-4">Something went wrong</h2>
            <p className="text-secondary mb-8">
              {this.state.error?.message.startsWith('{') 
                ? "A database error occurred. Please try again later." 
                : "An unexpected error occurred. Please refresh the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-secondary transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              role: 'user',
              createdAt: new Date().toISOString()
            });
            setIsAdmin(false);
          } else {
            setIsAdmin(userDoc.data().role === 'admin');
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

const QuickEnquiryForm = ({ initialPackage = "" }: { initialPackage?: string }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [packageTitle, setPackageTitle] = useState(initialPackage);

  useEffect(() => {
    if (initialPackage) setPackageTitle(initialPackage);
  }, [initialPackage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const enquiryData = {
      uid: user.uid,
      name: data.name as string,
      email: data.email as string,
      phone: data.phone as string,
      packageTitle: packageTitle,
      travelers: Number(data.travelers),
      startDate: data.travelDate as string,
      specialRequests: data.message as string || "",
      totalAmount: 0,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const path = 'bookings';
    try {
      await addDoc(collection(db, path), enquiryData);
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] shadow-sm text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif text-primary mb-4">Enquiry Sent!</h3>
        <p className="text-secondary mb-8">
          Thank you for your interest. We've received your enquiry and will get back to you shortly.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-secondary transition-all"
        >
          Send Another Enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-nature-white p-10 rounded-[3rem] shadow-sm" id="booking-form">
      <h3 className="text-2xl font-serif text-primary mb-8">Quick Enquiry</h3>
      {!user && (
        <div className="mb-8 p-6 bg-accent/30 rounded-2xl flex items-center space-x-4">
          <UserIcon className="w-6 h-6 text-primary" />
          <p className="text-sm text-primary">
            Please <button onClick={signInWithGoogle} className="font-bold underline">sign in</button> to book your trip and track your requests.
          </p>
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" 
            name="name" 
            placeholder="Your Name" 
            required 
            defaultValue={user?.displayName || ""}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            required 
            defaultValue={user?.email || ""}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="tel" 
            name="phone" 
            placeholder="Phone Number" 
            required 
            className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
          <select 
            name="packageTitle" 
            required 
            value={packageTitle}
            onChange={(e) => setPackageTitle(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="">Select Package</option>
            {PACKAGES.map((pkg, i) => <option key={i} value={pkg.title}>{pkg.title}</option>)}
            <option value="Custom Trip">Custom Trip</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary uppercase ml-2">Travel Date</label>
            <input 
              type="date" 
              name="travelDate" 
              required 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary uppercase ml-2">Number of Travelers</label>
            <input 
              type="number" 
              name="travelers" 
              placeholder="Number of Travelers" 
              required 
              min="1"
              max="99"
              className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>
        <textarea 
          name="message" 
          placeholder="Special Requirements or Message" 
          rows={4} 
          className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        ></textarea>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <MessageSquare className="w-6 h-6 mr-2" />
          )}
          Send Enquiry
        </button>
        <div className="text-center pt-4">
          <p className="text-sm text-secondary mb-4">Ready to book your trip now?</p>
          <button 
            type="button"
            onClick={() => {
              const event = new CustomEvent('go-to-booking');
              window.dispatchEvent(event);
            }}
            className="text-primary font-bold underline hover:text-secondary transition-colors"
          >
            Go to Full Booking Page
          </button>
        </div>
      </form>
    </div>
  );
};

const MyBookings = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'), 
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-8 border-b border-black/5 flex items-center justify-between bg-nature-white">
          <div>
            <h3 className="text-2xl font-serif text-primary">My Bookings</h3>
            <p className="text-sm text-secondary">Track your travel requests</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-secondary">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Map className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg text-primary font-medium">No bookings found</p>
              <p className="text-secondary mb-8">Ready to start your adventure?</p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-secondary transition-all"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-6 bg-nature-white rounded-3xl border border-black/5 hover:border-primary/20 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-primary">{booking.packageTitle}</h4>
                    <p className="text-sm text-secondary flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start md:self-center ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary text-xs uppercase font-bold mb-1">Travel Date</p>
                    <p className="text-primary font-medium">{(booking.startDate || booking.travelDate) ? new Date(booking.startDate || booking.travelDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-secondary text-xs uppercase font-bold mb-1">Travelers</p>
                    <p className="text-primary font-medium">{booking.travelers} People</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-secondary text-xs uppercase font-bold mb-1">Contact</p>
                    <p className="text-primary font-medium truncate">{booking.phone}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const AuthButton = ({ isScrolled, onShowBookings }: { isScrolled: boolean, onShowBookings: () => void }) => {
  const { user, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) return <div className="w-10 h-10 rounded-full bg-accent/20 animate-pulse" />;

  if (!user) {
    return (
      <button 
        onClick={signInWithGoogle}
        className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 ${
          isScrolled ? 'bg-primary text-white' : 'bg-white text-primary'
        }`}
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/50 group-hover:border-accent transition-all">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || 'User'} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-black/5"
              >
                <div className="p-4 border-b border-black/5 mb-2">
                  <p className="font-bold text-primary truncate">{user.displayName}</p>
                  <p className="text-xs text-secondary truncate">{user.email}</p>
                </div>

                <button 
                  onClick={() => {
                    const event = new CustomEvent('go-to-booking');
                    window.dispatchEvent(event);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 text-primary hover:bg-nature-white rounded-2xl transition-colors mb-1"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold">Book New Trip</span>
                </button>
                
                <button 
                  onClick={() => {
                    onShowBookings();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 text-primary hover:bg-nature-white rounded-2xl transition-colors mb-1"
                >
                  <Map className="w-5 h-5" />
                  <span className="font-bold">My Bookings</span>
                </button>

                <button 
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold">Sign Out</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const EnquireButton = ({ text, className = "", message = "Hi, I'm interested in planning a trip to Northeast India." }: { text: string, className?: string, message?: string }) => (
  <a 
    href={WHATSAPP_LINK(message)}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-full font-semibold transition-all hover:bg-secondary hover:scale-105 active:scale-95 shadow-lg ${className}`}
  >
    <MessageSquare className="w-5 h-5 mr-2" />
    {text}
  </a>
);

const BookingPage = ({ selectedPackage, onBack }: { selectedPackage: string, onBack: () => void }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  
  const pkg = PACKAGES.find(p => p.title === selectedPackage) || PACKAGES[0];
  const basePrice = parseInt(pkg.price.replace(/[^0-9]/g, ''));
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    travelers: 1,
    startDate: "",
    endDate: "",
    pickup: "",
    specialRequests: "",
    vehicleType: "Car",
    stayPreference: "Standard",
    guideRequired: "No"
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (formData.startDate) {
      const days = parseInt(pkg.duration.split('–').pop() || pkg.duration.split('-').pop() || "1");
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + days);
      setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
    }
  }, [formData.startDate, pkg.duration]);

  const totalAmount = basePrice * formData.travelers;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    setIsSubmitting(true);
    const path = 'bookings';
    
    const bookingData = {
      ...formData,
      uid: user.uid,
      packageTitle: pkg.title,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, path), bookingData);
      setBookingId(docRef.id);
      
      // Construct WhatsApp Message
      const message = `*New Booking Request - Ojaantric Jajabor*\n\n` +
        `*Package:* ${pkg.title}\n` +
        `*Customer:* ${formData.name}\n` +
        `*Email:* ${formData.email}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*Travelers:* ${formData.travelers}\n` +
        `*Start Date:* ${formData.startDate}\n` +
        `*End Date:* ${formData.endDate}\n` +
        `*Pickup:* ${formData.pickup}\n` +
        `*Vehicle:* ${formData.vehicleType}\n` +
        `*Stay:* ${formData.stayPreference}\n` +
        `*Guide:* ${formData.guideRequired}\n` +
        `*Total Amount:* ₹${totalAmount.toLocaleString()}\n` +
        `*Special Requests:* ${formData.specialRequests || 'None'}\n\n` +
        `*Booking ID:* ${docRef.id}`;

      // Open WhatsApp
      window.open(WHATSAPP_LINK(message), '_blank');
      
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-nature-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-serif text-primary mb-4">Trip Booked Successfully!</h2>
          <p className="text-xl text-secondary mb-8">
            Your adventure with Ojaantric Jajabor is confirmed. We've sent the details to your email.
          </p>
          
          <div className="bg-nature-white p-6 rounded-3xl mb-8 text-left border border-black/5">
            <p className="text-sm text-secondary uppercase tracking-wider font-bold mb-2">Booking ID</p>
            <p className="text-2xl font-mono text-primary font-bold">{bookingId}</p>
          </div>

          <button 
            onClick={onBack}
            className="px-12 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-secondary transition-all shadow-lg"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nature-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-primary font-bold hover:text-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl md:text-2xl font-serif text-primary">Complete Your Booking</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-6 pt-12 max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary text-white' : 'bg-white text-secondary border border-black/10'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 md:w-24 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-black/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-black/5"
                >
                  <h3 className="text-2xl font-serif text-primary mb-8 flex items-center">
                    <UserIcon className="w-6 h-6 mr-3 text-secondary" />
                    User Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase ml-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase ml-2">Number of Travelers</label>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                          className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-nature-white transition-all"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.travelers}</span>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, travelers: prev.travelers + 1 }))}
                          className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-nature-white transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={nextStep}
                      disabled={!formData.name || !formData.phone || !formData.email}
                      className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-lg disabled:opacity-50"
                    >
                      Next: Travel Details
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-black/5"
                >
                  <h3 className="text-2xl font-serif text-primary mb-8 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-secondary" />
                    Travel Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Start Date</label>
                        <input 
                          type="date" 
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">End Date (Auto-calculated)</label>
                        <input 
                          type="date" 
                          name="endDate"
                          value={formData.endDate}
                          readOnly
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white/50 border border-black/5 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase ml-2">Pickup Location</label>
                      <input 
                        type="text" 
                        name="pickup"
                        value={formData.pickup}
                        onChange={handleInputChange}
                        placeholder="e.g. Guwahati Airport"
                        className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Vehicle Type</label>
                        <select 
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option>Car</option>
                          <option>Bike</option>
                          <option>Self-drive</option>
                          <option>Cab</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Stay Preference</label>
                        <select 
                          name="stayPreference"
                          value={formData.stayPreference}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option>Budget</option>
                          <option>Standard</option>
                          <option>Premium</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase ml-2">Guide Required</label>
                        <select 
                          name="guideRequired"
                          value={formData.guideRequired}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase ml-2">Special Requests</label>
                      <textarea 
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Any specific requirements..."
                        rows={3}
                        className="w-full px-6 py-4 rounded-2xl bg-nature-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={prevStep}
                        className="flex-1 py-5 border border-black/10 text-primary rounded-2xl font-bold text-lg hover:bg-nature-white transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={nextStep}
                        disabled={!formData.startDate || !formData.pickup}
                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-lg disabled:opacity-50"
                      >
                        Next: Payment
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-black/5"
                >
                  <h3 className="text-2xl font-serif text-primary mb-8 flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-3 text-secondary" />
                    Confirm Booking
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="bg-nature-white p-6 rounded-3xl border border-black/5 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-black/5">
                        <span className="text-secondary font-medium">Package</span>
                        <span className="text-primary font-bold">{pkg.title}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-black/5">
                        <span className="text-secondary font-medium">Travelers</span>
                        <span className="text-primary font-bold">{formData.travelers}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-black/5">
                        <span className="text-secondary font-medium">Start Date</span>
                        <span className="text-primary font-bold">{formData.startDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-bold text-lg">Total Amount</span>
                        <span className="text-primary font-bold text-2xl">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-6 bg-accent/20 rounded-2xl">
                      <p className="text-sm text-primary leading-relaxed flex items-start">
                        <MessageSquare className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          By clicking confirm, your booking details will be sent to our team via WhatsApp for final confirmation and payment instructions.
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={prevStep}
                        className="flex-1 py-5 border border-black/10 text-primary rounded-2xl font-bold text-lg hover:bg-nature-white transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <MessageSquare className="w-6 h-6 mr-2" />
                        )}
                        Confirm & WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 sticky top-32">
              <h4 className="text-xl font-serif text-primary mb-6">Package Summary</h4>
              
              <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
                <img 
                  src={pkg.image} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">{pkg.duration}</p>
                  <p className="font-bold">{pkg.title}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Price per person</span>
                  <span className="font-bold text-primary">{pkg.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Travelers</span>
                  <span className="font-bold text-primary">× {formData.travelers}</span>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="font-bold text-primary">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Free cancellation up to 7 days before travel</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>24/7 on-trip local support</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Verified local guides & drivers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionHeading = ({ title, subtitle, light = false }: { title: string, subtitle?: string, light?: boolean }) => (
  <div className="mb-12 text-center">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-5xl font-serif mb-4 ${light ? 'text-white' : 'text-primary'}`}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`max-w-2xl mx-auto text-lg ${light ? 'text-white/80' : 'text-secondary'}`}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [currentPage, setCurrentPage] = useState<'home' | 'booking'>('home');
  const [showBookings, setShowBookings] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleShowBookings = () => setShowBookings(true);
    const handleGoToBooking = () => {
      setCurrentPage('booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('show-my-bookings', handleShowBookings);
    window.addEventListener('go-to-booking', handleGoToBooking);
    return () => {
      window.removeEventListener('show-my-bookings', handleShowBookings);
      window.removeEventListener('go-to-booking', handleGoToBooking);
    };
  }, []);

  const handleBookNow = (pkgTitle: string) => {
    setSelectedPackage(pkgTitle);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (currentPage === 'booking') {
    return (
      <>
        <BookingPage 
          selectedPackage={selectedPackage} 
          onBack={() => setCurrentPage('home')} 
        />
        <AnimatePresence>
          {showBookings && <MyBookings onClose={() => setShowBookings(false)} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative">
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-3">
            <img 
              src={LOGO_URL} 
              alt="Ojaantric Jajabor Logo" 
              className="h-12 w-auto rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
            <span className={`text-lg md:text-2xl font-serif font-bold tracking-tight ${isScrolled ? 'text-primary' : 'text-white'}`}>
              Ojaantric Jajabor
            </span>
          </a>
          
            <div className="hidden md:flex items-center space-x-8">
              {['About', 'Destinations', 'Services', 'Packages', 'Reviews', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className={`text-sm font-medium uppercase tracking-widest transition-colors hover:text-secondary ${isScrolled ? 'text-primary' : 'text-white'}`}
                >
                  {item}
                </a>
              ))}
              <AuthButton isScrolled={isScrolled} onShowBookings={() => setShowBookings(true)} />
            </div>

          <button 
            className={`md:hidden ${isScrolled ? 'text-primary' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-primary shadow-xl p-8 flex flex-col space-y-6 md:hidden"
          >
              <div className="flex flex-col space-y-4">
                {['Destinations', 'Services', 'Packages', 'Reviews', 'Contact'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white text-xl font-medium hover:text-accent transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentPage('booking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-white text-xl font-medium hover:text-accent transition-colors text-left flex items-center"
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Book Now
                </button>
                {user && (
                  <button 
                    onClick={() => {
                      // We need to trigger the MyBookings modal from here
                      // I'll add a state to AppContent to control this
                      setMobileMenuOpen(false);
                      const event = new CustomEvent('show-my-bookings');
                      window.dispatchEvent(event);
                    }}
                    className="text-white text-xl font-medium hover:text-accent transition-colors text-left flex items-center"
                  >
                    <Map className="w-6 h-6 mr-3" />
                    My Bookings
                  </button>
                )}
                <div className="pt-4">
                  <AuthButton isScrolled={false} onShowBookings={() => setShowBookings(true)} />
                </div>
              </div>

            <div className="pt-8 border-t border-white/10">
              <h4 className="text-white font-bold mb-6 text-lg">Connect With Us</h4>
              <div className="flex space-x-4">
                <a 
                  href={WHATSAPP_LINK("Hi!")} 
                  className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="w-6 h-6" />
                </a>
                <a 
                  href="https://instagram.com/ojaantricjajabornortheast" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a 
                  href="https://maps.app.goo.gl/63Xiv444H2jDh4od9?g_st=ac" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-primary">
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover scale-105 opacity-60"
          >
            <source src="https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/370a01404c31fc789ca6f1497e1d579d28129.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white pt-32 md:pt-0">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-8xl font-serif font-bold mb-6 tracking-tight leading-tight"
          >
            Ojaantric Jajabor <br /> <span className="text-accent">Northeast</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl font-light italic mb-8 text-accent/90"
          >
            "Explore the Hidden Gems of Northeast India"
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto text-lg md:text-xl text-white/80 leading-relaxed"
          >
            From Kaziranga's wild safaris to Tawang's snow-covered peaks, we design journeys that feel personal, authentic, and unforgettable.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-4 text-sm text-accent/60 uppercase tracking-[0.2em] font-medium"
          >
            Scroll down for more details
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <EnquireButton text="Plan Your Trip" message="Hi, I'd like to plan a trip to Northeast India." />
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hidden md:block"
        >
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Why Travel With Us" 
            subtitle="We bring years of local expertise to ensure your Northeast adventure is nothing short of magical."
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: "4+ Years Trusted", icon: <Star className="text-secondary" /> },
              { label: "Guwahati Based", icon: <MapPin className="text-secondary" /> },
              { label: "All 7 Sisters", icon: <Compass className="text-secondary" /> },
              { label: "24/7 Support", icon: <Clock className="text-secondary" /> },
              { label: "Budget Friendly", icon: <CheckCircle2 className="text-secondary" /> },
              { label: "100+ Custom Plans", icon: <Users className="text-secondary" /> }
            ].map((point, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-nature-white transition-colors"
              >
                <div className="mb-4 p-3 bg-accent/30 rounded-full">
                  {point.icon}
                </div>
                <span className="font-semibold text-primary">{point.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Destinations Section --- */}
      <section id="destinations" className="py-24 bg-nature-white">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Discover Northeast India" 
            subtitle="Explore the diverse landscapes and cultures of the Seven Sister States."
          />

          {/* Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.map((dest, idx) => (
              <motion.div 
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedDest(dest.id)}
                className="group cursor-pointer relative h-[30rem] rounded-3xl overflow-hidden shadow-md transition-all hover:-translate-y-2"
              >
                <motion.img 
                  src={dest.image} 
                  alt={dest.name} 
                  animate={{ scale: selectedDest === dest.id ? 1.1 : 1 }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Initial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-60" />
                
                {/* Initial Content */}
                <div className={`absolute bottom-0 left-0 p-6 text-white transition-all duration-300 ${selectedDest === dest.id ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <h4 className="text-2xl font-serif mb-2">{dest.name}</h4>
                  <p className="text-sm text-white/70 line-clamp-2">{dest.shortDesc}</p>
                </div>

                {/* Interactive Detailed Overlay */}
                <AnimatePresence>
                  {selectedDest === dest.id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md p-6 overflow-y-auto custom-scrollbar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDest(null);
                      }}
                    >
                      <div className="min-h-full flex flex-col justify-center py-8">
                        <button 
                          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDest(null);
                          }}
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h4 className="text-3xl font-serif text-accent mb-4">{dest.name}</h4>
                          <p className="text-sm text-white/90 leading-relaxed mb-6">
                            {dest.fullDesc}
                          </p>
                          
                          <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-accent/60">Highlights</p>
                            <div className="flex flex-wrap gap-2">
                              {dest.highlights.map((h, i) => (
                                <span key={i} className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full border border-white/10">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-8">
                            <EnquireButton 
                              text="Plan This Trip" 
                              className="w-full py-3 text-sm" 
                              message={`Hi, I'm interested in visiting ${dest.name}.`}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Services Section --- */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Our Travel Services" 
            subtitle="Everything you need for a perfect Northeast adventure — tailored just for you."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {SERVICES.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-nature-white rounded-3xl hover:bg-primary hover:text-white transition-all duration-300 group"
              >
                <div className="mb-6 p-4 bg-white rounded-2xl text-primary group-hover:bg-white/20 group-hover:text-white inline-block">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{service.title}</h4>
                <p className="text-secondary group-hover:text-white/80">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Packages Section --- */}
      <section id="packages" className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Our Travel Packages" 
            subtitle="Handpicked itineraries designed to show you the very best of the Seven Sisters."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {PACKAGES.map((pkg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white text-primary rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="h-64 relative">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                    {pkg.duration}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-serif mb-4">{pkg.title}</h3>
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start text-secondary">
                        <ChevronRight className="w-5 h-5 mr-2 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-black/5">
                    <div className="flex-1 w-full sm:w-auto">
                      <span className="text-sm text-secondary block">Starting from</span>
                      <span className="text-2xl font-bold text-primary">{pkg.price}</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleBookNow(pkg.title)}
                        className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-secondary transition-all shadow-md active:scale-95"
                      >
                        Book Now
                      </button>
                      <a 
                        href={WHATSAPP_LINK(`Hi, I'm interested in the ${pkg.title} package.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-nature-white text-primary rounded-full hover:bg-black/5 transition-all border border-black/5"
                        title="Enquire on WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Why Choose Us --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">Your Local Northeast Expert</h2>
                <p className="text-lg text-secondary mb-8 leading-relaxed">
                  We're not just a travel agency — we're Northeast enthusiasts who've lived these journeys. Based in Guwahati, we understand the terrain, the culture, and the hidden paths that others miss.
                </p>
                <div className="space-y-4">
                  {[
                    "4+ Years of Real Experience",
                    "Local Northeast Experts",
                    "Budget-Friendly, No Compromise",
                    "100% Customized Plans",
                    "Trusted by Real Travelers"
                  ].map((point, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-primary">{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl bg-nature-white"
              >
                <img 
                  src="https://tharun3721f.wordpress.com/wp-content/uploads/2026/03/c5e2eb125c4c0a37796fc2d3f463dcee281296126617128481225568.jpg" 
                  alt="Local Expert" 
                  className="w-full h-[300px] md:h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-50 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Reviews Section --- */}
      <section id="reviews" className="py-24 bg-nature-white">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="What Travelers Say" 
            subtitle="Real stories from people who explored the Northeast with us."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {REVIEWS.map((review, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm relative"
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-accent/20" />
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mr-4">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary">{review.name}</h4>
                    <span className="text-sm text-secondary">{review.location} • {review.trip}</span>
                  </div>
                </div>
                <p className="text-lg text-secondary italic leading-relaxed">"{review.text}"</p>
                <div className="flex mt-6 text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact & Enquiry Section --- */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Contact Info */}
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8">Plan Your Next Adventure</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="bg-primary text-white p-4 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary mb-1">Our Location</h4>
                    <p className="text-secondary">Guwahati, Assam, India</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-primary text-white p-4 rounded-2xl">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary mb-1">WhatsApp / Phone</h4>
                    <p className="text-secondary">+91 60034 10721</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-primary text-white p-4 rounded-2xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary mb-1">Availability</h4>
                    <p className="text-secondary">8 AM – 10 PM (Daily)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-primary text-white p-4 rounded-2xl">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary mb-1">Instagram</h4>
                    <p className="text-secondary">@ojaantricjajabornortheast</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <EnquireButton text="Enquire on WhatsApp" className="w-full md:w-auto" />
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="lg:w-1/2">
              <QuickEnquiryForm initialPackage={selectedPackage} />
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">Fastest way to plan your trip is via WhatsApp</h2>
          <EnquireButton text="Enquire Now" className="px-12 py-5 text-xl" />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-primary text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={LOGO_URL} 
                  alt="Ojaantric Jajabor Logo" 
                  className="h-16 w-auto rounded-xl object-contain"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-2xl font-serif font-bold">Ojaantric Jajabor Northeast</h3>
              </div>
              <p className="text-white/70 leading-relaxed">
                Based in Guwahati, helping travelers explore the Seven Sister States with local expertise and passion. We turn your travel dreams into reality.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['About', 'Destinations', 'Services', 'Packages', 'Reviews', 'Contact'].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase()}`} className="text-white/70 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href={WHATSAPP_LINK("Hi!")} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/ojaantricjajabornortheast" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://maps.app.goo.gl/63Xiv444H2jDh4od9?g_st=ac" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <MapPin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 text-center text-white/50 text-sm">
            <p>© {new Date().getFullYear()} Ojaantric Jajabor Northeast. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showBookings && <MyBookings onClose={() => setShowBookings(false)} />}
      </AnimatePresence>
    </div>
  );
}
