"use client";
import Board from "@/components/Playground";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { PrivyProvider } from "@privy-io/react-auth";
import DataContextProvider from "@/context/DataContext";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/utils/wallet-utils";

export default function Home() {
  const queryClient = new QueryClient();
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <PrivyProvider
              appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
              config={{
                // Customize Privy's appearance in your app
                appearance: {
                  theme: "light",
                  accentColor: "#676FFF",
                  logo: "https://docs.privy.io/privy-logo-dark.png",
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                  createOnLogin: "all-users",
                },
              }}
            >
              <DataContextProvider>
                <div className="overflow-hidden h-[100vh] w-[100vw]">
                  <Board />
                </div>
              </DataContextProvider>
            </PrivyProvider>
          </RainbowKitProvider>
          <Toaster />
        </QueryClientProvider>
      </WagmiConfig>
      );
    </>
  );
}
