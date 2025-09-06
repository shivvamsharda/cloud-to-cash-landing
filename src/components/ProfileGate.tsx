import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { ProfileCreationModal } from '@/components/ProfileCreationModal';

const ProfileGate: React.FC = () => {
  const { user, isNewUser, session } = useAuth();
  const { publicKey } = useWallet();

  if (!user) return null;

  const walletAddress = publicKey?.toBase58() || (session?.user?.user_metadata as any)?.publicKey || '';

  return (
    <>
      {isNewUser && (
        <ProfileCreationModal
          isOpen={true}
          walletAddress={walletAddress}
          userId={user.id}
        />
      )}
    </>
  );
};

export default ProfileGate;
