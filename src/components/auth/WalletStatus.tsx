import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export const WalletStatus = () => {
  const { isAuthenticated, publicKey, signOut } = useAuth();

  if (!isAuthenticated || !publicKey) {
    return null;
  }

  const truncatedAddress = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-white text-sm">
        <Wallet className="w-4 h-4" />
        <span className="font-mono">{truncatedAddress}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="text-white/70 hover:text-white hover:bg-white/10"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};