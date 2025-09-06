import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProfileAvatarProps {
  profile?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profile }) => {
  const { signOut, publicKey } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleProfileClick = () => {
    navigate('/setup-profile');
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-8 h-8 border-2 border-[hsl(var(--button-green))]/30 hover:border-[hsl(var(--button-green))]/60 transition-colors">
          <AvatarImage src={profile?.avatar_url} alt={profile?.name || 'User'} />
          <AvatarFallback className="bg-[hsl(var(--button-green))]/20 text-[hsl(var(--button-green))] text-xs font-semibold">
            {getInitials(profile?.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-700">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{profile?.name || 'User'}</p>
          <p className="text-xs text-white/60">@{profile?.username || 'username'}</p>
          {publicKey && (
            <p className="text-xs text-white/40 font-mono mt-1">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </p>
          )}
        </div>
        <DropdownMenuSeparator className="bg-neutral-700" />
        <DropdownMenuItem 
          onClick={handleProfileClick}
          className="text-white hover:bg-neutral-800 cursor-pointer"
        >
          <User className="w-4 h-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-700" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-400 hover:bg-neutral-800 hover:text-red-300 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};