import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, PenSquare, LogOut, User, Settings, BookMarked, BarChart3, Moon, Sun, Search } from 'lucide-react';
import { toast } from 'sonner';
import routes from '@/routes';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = routes.filter((route) => route.visible);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold text-foreground">BlogPlatform</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-smooth ${
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/search')}
              title="Search"
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user && profile ? (
              <>
                {(profile.role === 'creator' || profile.role === 'admin') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/create')}
                    className="hidden md:flex items-center gap-2"
                  >
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Button>
                )}

                <div className="hidden md:flex items-center gap-2">
                  {(profile.role === 'creator' || profile.role === 'admin') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/analytics')}
                      title="Analytics"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/bookmarks')}
                    title="Bookmarks"
                  >
                    <BookMarked className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/profile/${profile.username}`)}
                    title="Profile"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/login')}>Get Started</Button>
              </div>
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-base font-medium px-4 py-2 rounded-md transition-smooth ${
                        location.pathname === item.path
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {user && profile ? (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-3 px-4 py-2 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={profile.avatar_url || undefined}
                              alt={profile.username}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{profile.full_name || profile.username}</span>
                            <span className="text-xs text-muted-foreground">@{profile.username}</span>
                          </div>
                        </div>

                        {(profile.role === 'creator' || profile.role === 'admin') && (
                          <Button
                            variant="default"
                            className="w-full mb-2"
                            onClick={() => {
                              navigate('/create');
                              setIsMenuOpen(false);
                            }}
                          >
                            <PenSquare className="h-4 w-4 mr-2" />
                            Write a Post
                          </Button>
                        )}

                        {(profile.role === 'creator' || profile.role === 'admin') && (
                          <Button
                            variant="outline"
                            className="w-full justify-start mb-2"
                            onClick={() => {
                              navigate('/analytics');
                              setIsMenuOpen(false);
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            navigate('/search');
                            setIsMenuOpen(false);
                          }}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            navigate('/bookmarks');
                            setIsMenuOpen(false);
                          }}
                        >
                          <BookMarked className="h-4 w-4 mr-2" />
                          Bookmarks
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            navigate(`/profile/${profile.username}`);
                            setIsMenuOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            navigate('/settings');
                            setIsMenuOpen(false);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>

                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => {
                            handleSignOut();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigate('/login');
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          navigate('/login');
                          setIsMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
