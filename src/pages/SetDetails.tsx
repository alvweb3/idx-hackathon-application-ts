import React, { useEffect, useState } from 'react';
import { useWriteContract, useReadContract, useReadContracts } from 'wagmi';
import { useParams } from 'react-router-dom';
import { Erc20, SetToken, BasicIssuanceModule } from '../abis';
import { formatUnits, parseEther } from 'viem';

interface SetDetailsProps {
  userWallet: `0x${string}` | undefined;
}

interface ContractData {
  abi: any;
  address: `0x${string}`;
  functionName: string;
}

interface ComponentUnits {
  0: string[];
  1: bigint[];
}

interface TokenDecimal {
  result: number;
  status: string;
}

function SetDetails(props: SetDetailsProps) {
  const { userWallet } = props;
  const { address } = useParams<{ address: `0x${string}` }>(); // Get the address from the URL
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [approvalPosition, setApprovalPosition] = useState<number>(0);
  const [tokenContracts, setTokenContracts] = useState<ContractData[]>([]);
  const [stateComponentDecimals, setStateComponentDecimals] = useState<ContractData[]>([]);
  const [componentUnits, setComponentUnits] = useState<ComponentUnits | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<TokenDecimal[] | null>(null);

  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
  const basicIssuanceModuleAddress = '0x689Fb32D4197249639441CAaD53cfa73454dC19e';

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      { abi: SetToken, address, functionName: 'name' },
      { abi: SetToken, address, functionName: 'symbol' },
      { abi: SetToken, address, functionName: 'totalSupply' },
      { abi: SetToken, address, functionName: 'decimals' },
      { abi: SetToken, address, functionName: 'getComponents' },
    ],
  });

  useEffect(() => {
    if (data && Array.isArray(data) && data[4] && Array.isArray(data[4].result)) {
      setTokenContracts(data[4].result.map((tokenAddress: string) => ({
        abi: Erc20,
        address: tokenAddress as `0x${string}`,
        functionName: 'name',
      })));
    }
  }, [data]);

  const { data: tokenNames, isLoading: tokenNamesLoading, isError: tokenNamesError } = useReadContracts({
    contracts: tokenContracts,
  });

  const { data: componentUnitsData } = useReadContract({
    address: basicIssuanceModuleAddress,
    abi: BasicIssuanceModule,
    functionName: 'getRequiredComponentUnitsForIssue',
    args: [address, parseEther(`${tokenAmount}`)],
  });

  useEffect(() => {
    if (componentUnitsData && Array.isArray(componentUnitsData)) {
      setComponentUnits(componentUnitsData as unknown as ComponentUnits);
    }
  }, [componentUnitsData]);

  useEffect(() => {
    if (data && Array.isArray(data) && data[4] && Array.isArray(data[4].result)) {
      setStateComponentDecimals(data[4].result.map((tokenAddress: string) => ({
        abi: Erc20,
        address: tokenAddress as `0x${string}`,
        functionName: 'decimals',
      })));
    }
  }, [data]);

  const { data: tokenDecimalsData} = useReadContracts({
    contracts: stateComponentDecimals,
  });

  useEffect(() => {
    if (tokenDecimalsData && Array.isArray(tokenDecimalsData)) {
      setTokenDecimals(tokenDecimalsData as TokenDecimal[]);
    }
  }, [tokenDecimalsData]);

  useEffect(() => {
    console.log('Data:', data);
    console.log('Token Names:', tokenNames);
    console.log('Component Units:', componentUnits);
    console.log('Token Decimals:', tokenDecimals);
    
    if (componentUnits && tokenDecimals) {
      console.log(componentUnits[1][0].toString());
      console.log(tokenDecimals[0].result);
      console.log(formatUnits(componentUnits[1][0], tokenDecimals[0].result));
    }
  }, [data, tokenNames, componentUnits, tokenDecimals]);

  const handleInputChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTokenAmount(value === null ? 0 : parseFloat(value));
  };

  const handleInputChangeApproval = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setApprovalPosition(value === null ? 0 : parseInt(value));
  };

  const { writeContract } = useWriteContract();

  // Function to trigger the approve function for the specified position
  const handleApprove = (position: number) => {
    if (componentUnits && tokenDecimals) {
      writeContract({
        abi: Erc20,
        address: componentUnits[0][position] as `0x${string}`,
        functionName: 'approve',
        args: [basicIssuanceModuleAddress, componentUnits[1][position]],
      });
    }
  };

  // Function to trigger the issue function
  const handleIssue = () => {
    writeContract({
      abi: BasicIssuanceModule,
      address: basicIssuanceModuleAddress,
      functionName: 'issue',
      args: [address, parseEther(`${tokenAmount}`), userWallet],
    });
  };

  // Function to trigger the initialize function
  const handleInitialize = () => {
    writeContract({
      abi: BasicIssuanceModule,
      address: basicIssuanceModuleAddress,
      functionName: 'initialize',
      args: [address, ADDRESS_ZERO],
    });
  };

  // Function to trigger the redeem function
  const handleRedeem = () => {
    writeContract({
      abi: BasicIssuanceModule,
      address: basicIssuanceModuleAddress,
      functionName: 'redeem',
      args: [address, parseEther(`${tokenAmount}`), userWallet],
    });
  };

  return (
    <>
      <div className="verticalStack">
        <h1>Index Information</h1>
        <div className="propertyCardIndex">
          <div className="propertyRow">
            <span className="propertyLabel">Set Address:</span>
            <span className="propertyValue">{isLoading ? 'Loading...' : isError ? 'Error loading data' : address ? address : 'N/A'}</span>
          </div>
          <div className="propertyRow">
            <span className="propertyLabel">Name:</span>
            <span className="propertyValue">{isLoading ? 'Loading...' : isError ? 'Error loading data' : data ? String(data[0].result) : 'N/A'}</span>
          </div>
          <div className="propertyRow">
            <span className="propertyLabel">Symbol:</span>
            <span className="propertyValue">{isLoading ? 'Loading...' : isError ? 'Error loading data' : data ? String(data[1].result) : 'N/A'}</span>
          </div>
          <div className="propertyRow">
            <span className="propertyLabel">Total Supply:</span>
            <span className="propertyValue">{isLoading ? 'Loading...' : isError ? 'Error loading data' : data ? parseFloat(formatUnits(data[2].result as unknown as bigint, data[3].result as unknown as number)).toFixed(0) : 'N/A'}</span>
          </div>
          <div className="propertyRow">
            <span className="propertyLabel">Underlying Assets:</span>
            <span className="propertyValue">{tokenNamesLoading ? 'Loading token names...' : tokenNamesError ? 'Error loading token names' : tokenNames && tokenNames.map(name => name.result || 'N/A').join(', ')}</span>
          </div>
        </div>
        <div className="indexSymbolInput">
          <h2>Enter amount of index tokens to issue/redeem</h2>
          <input type="number" placeholder="Amount" value={tokenAmount} onChange={handleInputChangeAmount} />
        </div>
        <div className="indexSymbolInput">
          <h2>Enter position of token to approve</h2>
          <input type="number" placeholder="Amount" value={approvalPosition} onChange={handleInputChangeApproval} />
        </div>
        <div className="buttonContainer">
          <button className="issueButton" onClick={() => handleInitialize()}>Initialize</button>
          <button className="issueButton" onClick={() => handleApprove(approvalPosition)}>Approve</button>
          <button className="issueButton" onClick={() => handleIssue()}>Issue</button>
          <button className="redeemButton" onClick={() => handleRedeem()}>Redeem</button>
        </div>
      </div>
    </>
  );
}

export default SetDetails;
