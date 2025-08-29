import { Zap, Gift, Shield, Users, Wallet, DollarSign } from 'lucide-react'

export function Features() {
    return (
        <section className="py-12 md:py-20 bg-[hsl(var(--pure-black))]">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        WHY CHOOSE
                        <span className="block text-[hsl(var(--button-green))] mt-2">VAPEFI</span>
                    </h2>
                    <p className="text-xl text-white/70 leading-relaxed">Experience the future of vaping with cutting-edge technology and instant rewards</p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y divide-[hsl(var(--card-border))] border border-[hsl(var(--card-border))] *:p-12 sm:grid-cols-2 lg:grid-cols-3 bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--pure-black))] rounded-2xl">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">Real-Time Tracking</h3>
                        </div>
                        <p className="text-sm text-white/70">Every puff is tracked instantly with precision technology, ensuring accurate reward calculations.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Gift className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">Instant Rewards</h3>
                        </div>
                        <p className="text-sm text-white/70">Get rewarded immediately for your activity. No waiting periods, no delays - instant gratification.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">Secure & Private</h3>
                        </div>
                        <p className="text-sm text-white/70">Your data is protected with bank-level security. Your privacy is our priority.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">Community Driven</h3>
                        </div>
                        <p className="text-sm text-white/70">Join thousands of users in a vibrant community. Compete, share, and grow together.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">Easy Withdrawal</h3>
                        </div>
                        <p className="text-sm text-white/70">Cash out your rewards effortlessly to your preferred wallet or payment method.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="size-4 text-[hsl(var(--button-green))]" />
                            <h3 className="text-sm font-bold text-white">No Hidden Fees</h3>
                        </div>
                        <p className="text-sm text-white/70">Transparent pricing with no surprise charges. What you earn is what you keep.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}