"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Heart, 
    CreditCard, 
    Smartphone, 
    Globe, 
    Shield, 
    ExternalLink,
    Copy,
    Check,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import BlurImage from "./ui/blur-image";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    const [copiedMethod, setCopiedMethod] = useState<string | null>(null);
    const [showCryptoAddresses, setShowCryptoAddresses] = useState(false);
    const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

    const copyToClipboard = async (text: string, method: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMethod(method);
            setTimeout(() => setCopiedMethod(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const cryptoOptions = {
        'USDT': {
            name: 'USDT',
            fullName: 'Tether USD',
            networks: {
                'BEP20': {
                    name: 'BNB Smart Chain (BEP20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                },
                'ERC20': {
                    name: 'Ethereum (ERC20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                }
            }
        },
        'USDC': {
            name: 'USDC',
            fullName: 'USD Coin',
            networks: {
                'BEP20': {
                    name: 'BNB Smart Chain (BEP20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                },
                'ERC20': {
                    name: 'Ethereum (ERC20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                }
            }
        },
        'BTC': {
            name: 'BTC',
            fullName: 'Bitcoin',
            networks: {
                'BTC': {
                    name: 'Bitcoin Network',
                    address: '19uGdEp55arbSZWeHeJTef8yRNbXVS521M',
                    shortAddress: '19uGd...XVS521M'
                }
            }
        },
        'ETH': {
            name: 'ETH',
            fullName: 'Ethereum',
            networks: {
                'BEP20': {
                    name: 'BNB Smart Chain (BEP20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                },
                'ERC20': {
                    name: 'Ethereum (ERC20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                }
            }
        },
        'BNB': {
            name: 'BNB',
            fullName: 'BNB',
            networks: {
                'BEP20': {
                    name: 'BNB Smart Chain (BEP20)',
                    address: '0x21A4D8C8acc4983f6cA2e74bAFcfF2052834ff10',
                    shortAddress: '0x21A4...ff10'
                }
            }
        }
    };

    const getCurrentAddress = () => {
        if (!selectedCrypto || !selectedNetwork) return null;
        const crypto = cryptoOptions[selectedCrypto as keyof typeof cryptoOptions];
        if (!crypto) return null;
        const network = crypto.networks[selectedNetwork as keyof typeof crypto.networks];
        return network || null;
    };

    const resetSelection = () => {
        setSelectedCrypto(null);
        setSelectedNetwork(null);
    };

    const donationMethods = [
        {
            id: "crypto",
            title: "Cryptocurrency",
            description: "Fast, secure, and direct donations",
            icon: <Globe className="h-6 w-6" />,
            color: "bg-gradient-to-r from-orange-500 to-yellow-500",
            methods: [
                {
                    name: "NOWPayments",
                    description: "Multi-cryptocurrency donations",
                    link: "https://nowpayments.io/donation/fund_palestine_gaza"
                },
                {
                    name: "Bitcoin",
                    description: "Most popular cryptocurrency",
                    address: "19uGdEp55arbSZWeHeJTef8yRNbXVS521M",
                    shortAddress: "19uGd...XVS521M"
                },
                {
                    name: "Ethereum",
                    description: "Smart contract platform",
                    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                    shortAddress: "0x742d...4d8b6"
                },
                {
                    name: "USDT (TRC20)",
                    description: "Stablecoin on Tron network",
                    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
                    shortAddress: "TQn9...cbLSE"
                }
            ]
        },
        {
            id: "mobile",
            title: "Mobile Payments",
            description: "Quick donations via mobile apps",
            icon: <Smartphone className="h-6 w-6" />,
            color: "bg-gradient-to-r from-green-500 to-emerald-500",
            methods: [
                // For now we accept on Binance app and Redotpay app
                // Redotpay is more popular in MENA region
                // 1. Scan QR code with Binance app to donate
                {
                    name: "Binance App QR Code",
                    href: "https://s.binance.com/kLzgXaAA",
                    image: "/assets/images/donate-binance-qr.jpg",
                    hasLink: false,
                    alt: "Binance App QR Code for Donations",
                    width: 312,
                    height: 496,
                    description: "Scan this QR code with Binance app to donate"
                },
                // // 2. Binance Pay Request link
                // {
                //     name: "Binance Pay Request",
                //     link: "https://s.binance.com/kLzgXaAA",
                //     description: "Donate using Binance Pay Request link"
                // },
                // 3. Binance ID: 67318838
                {
                    name: "Binance ID",
                    details: "67318838",
                    description: "Donate using Binance ID in Binance Pay"
                },
                // 4. Redotpay ID: 1756245868
                {
                    name: "Redotpay ID",
                    details: "1756245868",
                    description: "Donate using Redotpay ID in Redotpay app"
                }
            ]
        },
        {
            id: "traditional",
            title: "Traditional Banking",
            description: "Bank transfers and wire payments",
            icon: <CreditCard className="h-6 w-6" />,
            color: "bg-gradient-to-r from-blue-500 to-indigo-500",
            methods: [
                {
                    name: "PayPal",
                    details: "contactibo@duck.com",
                    description: "Quick and secure online payments"
                },
                {
                    name: "Bank Transfer",
                    details: "IBAN: TN59 24 031 085 2452 511101 96",
                    description: "Direct bank transfer to Gaza relief fund"
                }
            ]
        },
        {
            id: "organizations",
            title: "Trusted Organizations",
            description: "Established humanitarian organizations",
            icon: <Shield className="h-6 w-6" />,
            color: "bg-gradient-to-r from-purple-500 to-pink-500",
            methods: [
                {
                    name: "UNRWA",
                    link: "https://donate.unrwa.org/int/en/gaza",
                    description: "UN Relief and Works Agency for Palestine"
                },
                {
                    name: "WFP",
                    link: "https://www.wfp.org/emergencies/palestine-emergency",
                    description: "World Food Programme Gaza Emergency"
                },
                {
                    name: "Red Crescent",
                    link: "https://www.palestinercs.org/en/DonationNow",
                    description: "Palestinian Red Crescent Society"
                },
                {
                    name: "NOWPayments",
                    href: "https://nowpayments.io/donation/fund_palestine_gaza",
                    image: "https://nowpayments.io/images/embeds/donation-button-black.svg",
                    hasLink: true,
                    alt: "Crypto donation button by NOWPayments",
                    width: 192,
                    height: 48,
                    description: "Crypto donations with multiple currencies"
                }
            ]
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Heart className="h-6 w-6 text-red-500" />
                    Support Gaza Relief Efforts
                </DialogTitle>
                <DialogDescription className="text-base">
                    Choose your preferred donation method to help provide essential aid to the people of Gaza. 
                    Every contribution makes a difference in this humanitarian crisis.
                </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {donationMethods.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                        <CardHeader className={cn("text-white", category.color)}>
                            <div className="flex items-center gap-3">
                            {category.icon}
                            <div>
                                <CardTitle className="text-lg">{category.title}</CardTitle>
                                <CardDescription className="text-white/90">
                                {category.description}
                                </CardDescription>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {/* Special handling for cryptocurrency card */}
                            {category.id === "crypto" ? (
                                <>
                                    <Tabs defaultValue="nowpayments" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="nowpayments" className="data-[state=active]:bg-gradient-to-r from-orange-500 to-yellow-500 data-[state=active]:text-white">
                                                NOWPayments
                                            </TabsTrigger>
                                            <TabsTrigger value="direct" className="text-xs data-[state=active]:bg-gradient-to-r from-orange-500 to-yellow-500 data-[state=active]:text-white">
                                                {`Direct Addresses (Advanced)`}
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="nowpayments" className="mt-4">
                                            {/* NOWPayments iframe */}
                                            <div className="w-full border rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Multi-cryptocurrency donations
                                                    </Badge>
                                                </div>
                                                <div className="w-full h-full">
                                                    <iframe
                                                        className="w-full mx-auto pl-8 h-[calc(100vh+8rem)] border-0 rounded"
                                                        src="https://nowpayments.io/embeds/donation-widget?api_key=859f48ee-0cf3-4cf5-8840-c13c0d75df77"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="direct" className="mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    Direct on-chain addresses for advanced users
                                                </Badge>
                                            </div>

                                            {/* Step 1: Cryptocurrency Selection */}
                                            {!selectedCrypto && (
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm">Step 1: Choose Cryptocurrency</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(cryptoOptions).map(([key, crypto]) => (
                                                            <Button
                                                                key={key}
                                                                variant="outline"
                                                                className="h-auto p-3 flex flex-col items-center space-y-1"
                                                                onClick={() => setSelectedCrypto(key)}
                                                            >
                                                                <span className="font-semibold">{crypto.name}</span>
                                                                <span className="text-xs text-muted-foreground">{crypto.fullName}</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Network Selection */}
                                            {selectedCrypto && !selectedNetwork && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={resetSelection}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                        </Button>
                                                        <h4 className="font-semibold text-sm">Step 2: Choose Network</h4>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {Object.entries(cryptoOptions[selectedCrypto as keyof typeof cryptoOptions].networks).map(([networkKey, network]) => (
                                                            <Button
                                                                key={networkKey}
                                                                variant="outline"
                                                                className="w-full justify-start h-auto p-3"
                                                                onClick={() => setSelectedNetwork(networkKey)}
                                                            >
                                                                <div className="flex flex-col items-start">
                                                                    <span className="font-semibold">{network.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{selectedCrypto} on {network.name}</span>
                                                                </div>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Address Display */}
                                            {selectedCrypto && selectedNetwork && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedNetwork(null)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                        </Button>
                                                        <h4 className="font-semibold text-sm">Step 3: Copy Address</h4>
                                                    </div>
                                                    
                                                    {getCurrentAddress() && (
                                                        <div className="border rounded-lg p-4 bg-muted/20">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <h5 className="font-semibold">{selectedCrypto} Address</h5>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {(getCurrentAddress() as any)?.name}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {selectedCrypto}
                                                                </Badge>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <code className="text-xs bg-muted px-3 py-2 rounded flex-1 font-mono break-all">
                                                                        {(getCurrentAddress() as any)?.address}
                                                                    </code>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => copyToClipboard((getCurrentAddress() as any)?.address || '', `${selectedCrypto}-${selectedNetwork}`)}
                                                                        className="h-8 w-8 p-0 flex-shrink-0"
                                                                    >
                                                                        {copiedMethod === `${selectedCrypto}-${selectedNetwork}` ? (
                                                                            <Check className="h-3 w-3 text-green-500" />
                                                                        ) : (
                                                                            <Copy className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    ⚠️ Make sure you&apos;re sending {selectedCrypto} on the correct network to avoid loss of funds
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <Button
                                                        variant="outline"
                                                        onClick={resetSelection}
                                                        className="w-full"
                                                    >
                                                        Choose Different Cryptocurrency
                                                    </Button>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </>
                            ) : (
                                /* Regular method rendering for other categories */
                                category.methods.map((method, index) => (
                                    <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">{method.name}</h4>
                                            <Badge variant="secondary" className="text-xs">
                                                {method.description}
                                            </Badge>
                                        </div>
                                    
                                        {'address' in method && method.address && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                                                        {'shortAddress' in method ? method.shortAddress : ''}
                                                    </code>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(('address' in method ? method.address : '')!, `${category.id}-${index}`)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {copiedMethod === `${category.id}-${index}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Click copy to get full address
                                                </p>
                                            </div>
                                        )}

                                        {/* {'tag' in method && method.tag && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                                        {'tag' in method ? method.tag : ''}
                                                    </code>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(('tag' in method ? method.tag : '')!, `${category.id}-${index}`)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {copiedMethod === `${category.id}-${index}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )} */}
                                        
                                        {/* {'id' in method && method.id && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                                        {'id' in method ? method.id : ''}
                                                    </code>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(('id' in method ? method.id : '')!, `${category.id}-${index}`)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {copiedMethod === `${category.id}-${index}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )} */}

                                        {'details' in method && method.details && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                                                        {'details' in method ? method.details : ''}
                                                    </code>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(('details' in method ? method.details : '')!, `${category.id}-${index}`)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {copiedMethod === `${category.id}-${index}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {'link' in method && method.link && (
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Button asChild className="w-full" size="sm">
                                                    <Link href={'link' in method ? method.link : '#'} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3 w-3 mr-2" />
                                                        Donate Now
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {'image' in method && method.image && (
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                {method.hasLink ? (
                                                    <Link href={'image' in method ? method.href : '#'} target="_blank" rel="noopener noreferrer"
                                                        className={cn(
                                                            "inline-block relative flex-none",
                                                            // `w-[${method.width}px] h-[${method.height}px]` // in px w-48 h-12 = 192px x 48px
                                                        )}
                                                        style={{ width: method.width ? `${method.width}px` : 'auto', height: method.height ? `${method.height}px` : 'auto' }}
                                                    >
                                                        <BlurImage
                                                            src={'image' in method ? method.image : ''}
                                                            alt={'alt' in method ? method.alt || method.name : ''}
                                                            fill
                                                        />
                                                    </Link>
                                                ) : (
                                                    <div 
                                                        className={cn(
                                                            "inline-block relative flex-none",
                                                            // `w-[${method.width}px] h-[${method.height}px]` // in px w-48 h-12 = 192px x 48px
                                                        )}
                                                        style={{ width: method.width ? `${method.width}px` : 'auto', height: method.height ? `${method.height}px` : 'auto' }}
                                                    >
                                                        <BlurImage
                                                            src={'image' in method ? method.image : ''}
                                                            alt={'alt' in method ? method.alt || method.name : ''}
                                                            fill
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                ))}
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield className="relative flex-none h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">Important Notice</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                All donations go directly to verified humanitarian organizations and relief efforts. 
                                Please verify the authenticity of any donation links and be cautious of scams. 
                                Your support is crucial for providing essential aid to those in need.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
