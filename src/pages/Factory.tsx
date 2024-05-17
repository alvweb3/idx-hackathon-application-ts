import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { DownOutlined } from "@ant-design/icons";
import tokenList from "../data/tokenList.json";
import { useWriteContract } from "wagmi";
import { SetTokenCreator } from "../abis";
import { parseUnits } from 'viem';

interface Token {
  ticker: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
}

interface SelectedToken {
  token: Token;
  amount: number;
}

interface FactoryProps {
  status: string;
}

const Factory: React.FC<FactoryProps> = ({ status }) => {
  const [tokenOne, setTokenOne] = useState<Token>(tokenList[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [indexName, setIndexName] = useState("");
  const [indexSymbol, setIndexSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: any[];
  } | null>(null);

  const setTokenCreatorAddress = "0xe42C49c01E10B44a9d3E64F4111c916fB499d2A5";
  const basicIssuanceModuleAddress = "0x689Fb32D4197249639441CAaD53cfa73454dC19e";
  const managerAddress = "0x9DA962465E66795F646a80e73DA1a57e78cb6c01";

  const openModal = () => {
    setIsOpen(true);
  };

  const modifyToken = (i: number) => {
    const tokenData = tokenList[i];
    const tokenExists = selectedTokens.some(
      (item) => item.token.ticker === tokenData.ticker
    );

    if (!tokenExists) {
      setSelectedTokens([
        ...selectedTokens,
        { token: tokenData, amount: 1 },
      ]);
    }
    setIsOpen(false);
  };

  const updateTokenAmount = (ticker: string, newAmount: string) => {
    setSelectedTokens(
      selectedTokens.map((item) =>
        item.token.ticker === ticker
          ? { ...item, amount: parseInt(newAmount) }
          : item
      )
    );
  };

  const removeToken = (ticker: string) => {
    setSelectedTokens(
      selectedTokens.filter((item) => item.token.ticker !== ticker)
    );
  };

  const totalAmount = selectedTokens.reduce((sum, token) => sum + token.amount, 0);

  useEffect(() => {
    if (selectedTokens.length > 0 && indexName && indexSymbol) {
      const componentAddresses = selectedTokens.map(token => token.token.address);
      const componentUnits = selectedTokens.map(token => parseUnits(token.amount.toString(), token.token.decimals));
      const modules = [basicIssuanceModuleAddress];

      const newConfig = {
        address: setTokenCreatorAddress as `0x${string}`,
        abi: SetTokenCreator,
        functionName: 'create',
        args: [componentAddresses, componentUnits, modules, managerAddress, indexName, indexSymbol],
      };

      setConfig(newConfig);
    }
  }, [selectedTokens, indexName, indexSymbol]);

  const { writeContract, status: writeStatus } = useWriteContract();

  const handleCreateIndex = async () => {
    if (config) {
      setLoading(true);
      try {
        await writeContract(config);
        // Handle success (e.g., show a success message)
      } catch (error) {
        // Handle error (e.g., show an error message)
        console.error(error);
      }
      setLoading(false);
    }
  };

  if (status !== 'connected') {
    return <div className="connectButton">You are not logged in</div>;
  }

  return (
    <>
      <div className="headerContainer">
        <h1>Create Your Index</h1>
        <div className="tokenContainer">
          <h2>Select the underlying tokens</h2>
          <div className="selectedTokenIndex" onClick={openModal}>
            <img
              src={tokenOne.img}
              alt={tokenOne.ticker}
              className="assetLogo"
            />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="selectedTokensDisplay">
            {selectedTokens.map((item, index) => {
              const percentage = ((item.amount / totalAmount) * 100).toFixed(2);
              return (
                <div className="selectedToken2" key={index}>
                  <img
                    src={item.token.img}
                    alt={item.token.ticker}
                    className="tokenLogoSmall"
                  />
                  <span className="tokenTicker">{item.token.ticker}</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      updateTokenAmount(item.token.ticker, e.target.value)
                    }
                    min="1"
                    style={{ marginLeft: "10px" }}
                  />
                  <button
                    className="removeTokenButton"
                    onClick={() => removeToken(item.token.ticker)}
                  >
                    Remove
                  </button>
                  <div>
                    <div style={{ width: `${percentage}%` }}></div>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="indexNameInput">
            <h2>Enter index name</h2>
            <input
              type="text"
              placeholder="Enter index name"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
            />
          </div>
          <div className="indexSymbolInput">
            <h2>Enter index symbol</h2>
            <input
              type="text"
              placeholder="Enter index symbol"
              value={indexSymbol}
              onChange={(e) => setIndexSymbol(e.target.value)}
            />
          </div>
        </div>
        <button
          className="createIndex"
          onClick={handleCreateIndex}
          disabled={loading || writeStatus === "pending"}
        >
          {loading || writeStatus === "pending" ? "Creating..." : "Create Index"}
        </button>
      </div>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContentIndex">
          {tokenList.map((token, i) => (
            <div className="tokenChoice" key={i} onClick={() => modifyToken(i)}>
              <img src={token.img} alt={token.ticker} className="tokenLogo" />
              <div className="tokenChoiceNames">
                <div className="tokenName">{token.name}</div>
                <div className="tokenTicker">{token.ticker}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Factory;
