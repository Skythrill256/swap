"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import tokenList from "@uniswap/default-token-list"

interface Token {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

const defaultChainIdToName: { [key: number]: string } = {
  1: "Ethereum",
  10: "Optimism",
  56: "BNB Chain",
  137: "Polygon",
  42161: "Arbitrum One",
}

export interface TokenListProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectToken?: (token: Token) => void
  initialChainId?: number | "all"
  maxHeight?: string
  minHeight?: string
  showNetworkFilter?: boolean
  customTokens?: Token[]
  chainIdToName?: { [key: number]: string }
}

export const TokenList = React.forwardRef<HTMLDivElement, TokenListProps>(
  ({
    onSelectToken,
    initialChainId = "all",
    maxHeight = "400px",
    minHeight = "150px",
    showNetworkFilter = true,
    customTokens,
    chainIdToName = defaultChainIdToName,
    className,
    ...props
  }, ref) => {
    const [tokens, setTokens] = useState<Token[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedChain, setSelectedChain] = useState(initialChainId.toString())

    useEffect(() => {
      setTokens(customTokens || tokenList.tokens)
    }, [customTokens])

    const filteredTokens = tokens.filter(
      (token) =>
        (selectedChain === "all" || token.chainId.toString() === selectedChain) &&
        (token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md bg-background rounded-lg shadow-lg overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="p-4 border-b space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search name or paste address"
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {showNetworkFilter && (
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {Object.entries(chainIdToName).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]" style={{ maxHeight, minHeight }}>
          <div className="p-4">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <div
                  key={`${token.chainId}-${token.address}`}
                  className="flex items-center justify-between py-3 hover:bg-accent rounded-md px-2 cursor-pointer"
                  onClick={() => onSelectToken && onSelectToken(token)}
                >
                  <div className="flex items-center">
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {chainIdToName[token.chainId] || `Chain ID: ${token.chainId}`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground">No tokens found</div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }
)

TokenList.displayName = "TokenList"
