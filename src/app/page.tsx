"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDown, Settings, Info, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import tokenList from "@uniswap/default-token-list"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Token {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

interface TokenPrice {
  [symbol: string]: number
}

export default function SwapInterface() {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [showFromTokenList, setShowFromTokenList] = useState(false)
  const [showToTokenList, setShowToTokenList] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [tokenPrices, setTokenPrices] = useState<TokenPrice>({})

  useEffect(() => {
    setFilteredTokens(
      tokenList.tokens.filter((token) =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm])

  useEffect(() => {
    // Fetch token prices
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,aave,uniswap,chainlink&vs_currencies=usd');
        const data = await response.json();
        setTokenPrices({
          ETH: data.ethereum.usd,
          AAVE: data.aave.usd,
          UNI: data.uniswap.usd,
          LINK: data.chainlink.usd,
        });
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    };

    fetchTokenPrices();
  }, []);

  const handleSwap = () => {
    console.log("Swap initiated", { fromToken, toToken, fromAmount, toAmount })
  }

  const handleSelectToken = (token: Token, isFromToken: boolean) => {
    if (isFromToken) {
      setFromToken(token)
      setShowFromTokenList(false)
    } else {
      setToToken(token)
      setShowToTokenList(false)
    }
  }

  const calculateExchangeRate = () => {
    if (fromToken && toToken) {
      const fromPrice = tokenPrices[fromToken.symbol] || 0
      const toPrice = tokenPrices[toToken.symbol] || 0
      if (fromPrice && toPrice) {
        return (fromPrice / toPrice).toFixed(6)
      }
    }
    return '0'
  }

  const TokenListModal = ({ isFromToken }: { isFromToken: boolean }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#191B1F] rounded-[24px] w-full max-w-md p-6 shadow-2xl">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search name or paste address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="h-[400px] w-full">
          {filteredTokens.map((token) => (
            <div
              key={`${token.chainId}-${token.address}`}
              className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleSelectToken(token, isFromToken)}
            >
              <div className="flex items-center">
                <img src={token.logoURI} alt={token.name} className="w-8 h-8 mr-2 rounded-full" />
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-gray-500">{token.symbol}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                ${tokenPrices[token.symbol] ? tokenPrices[token.symbol].toFixed(2) : 'N/A'}
              </div>
            </div>
          ))}
        </ScrollArea>
        <Button onClick={() => isFromToken ? setShowFromTokenList(false) : setShowToTokenList(false)} className="mt-4 w-full bg-[#FF007A] hover:bg-[#FF007A]/90 text-white">
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#191B1F] flex items-center justify-center p-4">
      <Card className="w-full max-w-[464px] bg-white dark:bg-[#191B1F] shadow-lg rounded-[24px] border border-[#D2D9EE] dark:border-[#2C2F36]">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-medium text-[#0E111A] dark:text-white">Swap</h2>
            <div className="flex items-center space-x-2">
              <ConnectButton />
              <Button variant="ghost" size="icon" className="text-[#7780A0] hover:text-[#5E6B81] dark:text-[#6C7284] dark:hover:text-[#8F96AC]">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="bg-[#F7F8FA] dark:bg-[#212429] rounded-[20px] p-4 hover:ring-2 hover:ring-[#EDEEF2] dark:hover:ring-[#2C2F36] transition-all duration-200">
              <div className="flex justify-between mb-1">
                <Label htmlFor="fromAmount" className="text-sm text-[#7780A0] dark:text-[#6C7284]">From</Label>
                <span className="text-sm text-[#7780A0] dark:text-[#6C7284]">Balance: 0.0</span>
              </div>
              <div className="flex items-center">
                <Input
                  id="fromAmount"
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-[36px] font-medium bg-transparent border-none focus:ring-0 p-0 w-full text-[#0E111A] dark:text-white placeholder-[#7780A0] dark:placeholder-[#6C7284]"
                />
                <Button
                  onClick={() => setShowFromTokenList(true)}
                  className="ml-2 bg-[#EDEEF2] hover:bg-[#D2D9EE] dark:bg-[#2C2F36] dark:hover:bg-[#404040] text-[#0E111A] dark:text-white font-medium py-1 px-2 rounded-full text-[18px]"
                >
                  {fromToken ? (
                    <div className="flex items-center">
                      <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6 mr-2 rounded-full" />
                      {fromToken.symbol}
                    </div>
                  ) : (
                    "Select Token"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-center -my-2.5 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="bg-[#F7F8FA] dark:bg-[#212429] rounded-full shadow-md hover:shadow-lg transition-all duration-200 p-2"
                onClick={() => {
                  const tempToken = fromToken
                  setFromToken(toToken)
                  setToToken(tempToken)
                  const tempAmount = fromAmount
                  setFromAmount(toAmount)
                  setToAmount(tempAmount)
                }}
              >
                <ArrowDown className="h-4 w-4 text-[#7780A0] dark:text-[#6C7284]" />
              </Button>
            </div>

            <div className="bg-[#F7F8FA] dark:bg-[#212429] rounded-[20px] p-4 hover:ring-2 hover:ring-[#EDEEF2] dark:hover:ring-[#2C2F36] transition-all duration-200">
              <div className="flex justify-between mb-1">
                <Label htmlFor="toAmount" className="text-sm text-[#7780A0] dark:text-[#6C7284]">To</Label>
                <span className="text-sm text-[#7780A0] dark:text-[#6C7284]">Balance: 0.0</span>
              </div>
              <div className="flex items-center">
                <Input
                  id="toAmount"
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="text-[36px] font-medium bg-transparent border-none focus:ring-0 p-0 w-full text-[#0E111A] dark:text-white placeholder-[#7780A0] dark:placeholder-[#6C7284]"
                />
                <Button
                  onClick={() => setShowToTokenList(true)}
                  className="ml-2 bg-[#EDEEF2] hover:bg-[#D2D9EE] dark:bg-[#2C2F36] dark:hover:bg-[#404040] text-[#0E111A] dark:text-white font-medium py-1 px-2 rounded-full text-[18px]"
                >
                  {toToken ? (
                    <div className="flex items-center">
                      <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6 mr-2 rounded-full" />
                      {toToken.symbol}
                    </div>
                  ) : (
                    "Select Token"
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-[#7780A0] dark:text-[#6C7284] mt-4">
            <span>
              1 {fromToken?.symbol || "Token"} = {calculateExchangeRate()} {toToken?.symbol || "Token"}
              {fromToken && toToken && (
                <span className="ml-2">
                  (${tokenPrices[fromToken.symbol] ? tokenPrices[fromToken.symbol].toFixed(2) : 'N/A'})
                </span>
              )}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The estimated number of tokens you will receive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            className="w-full bg-[#FF007A] hover:bg-[#FF007A]/90 text-white font-medium py-4 px-4 rounded-[20px] mt-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSwap}
            disabled={!fromToken || !toToken || !fromAmount}
          >
            {!fromToken || !toToken ? "Select tokens" : !fromAmount ? "Enter an amount" : "Swap"}
          </Button>
        </CardContent>
      </Card>

      {showFromTokenList && <TokenListModal isFromToken={true} />}
      {showToTokenList && <TokenListModal isFromToken={false} />}
    </div>
  )
}
