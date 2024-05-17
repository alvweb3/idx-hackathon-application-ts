import React, { useEffect, useState } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { Link } from 'react-router-dom';
import { Controller, SetToken } from '../abis';

interface IndexesProps {
  status: string | undefined;
}

interface Contract {
  abi: any;
  address: `0x${string}`;
  functionName: string;
}

function Indexes(props: IndexesProps) {
  const { status } = props;
  const controllerAddress: `0x${string}` = "0x0Dfff3B3B9Cf50F19fEb6B5EBC9E3b800e3cd596";

  // Read the list of sets
  const {
    data: sets,
    isError: isErrorSets,
    isLoading: isLoadingSets,
  } = useReadContract({
    abi: Controller,
    address: controllerAddress,
    functionName: "getSets",
  });

  // State to store contracts for useReadContracts
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Update contracts whenever sets data changes
  useEffect(() => {
    if (sets && Array.isArray(sets) && sets.length > 0) {
      const newContracts: Contract[] = (sets as `0x${string}`[])
        .map((set: `0x${string}`) => [
          {
            abi: SetToken,
            address: set,
            functionName: "name",
          },
          {
            abi: SetToken,
            address: set,
            functionName: "symbol",
          },
          {
            abi: SetToken,
            address: set,
            functionName: "totalSupply",
          },
          {
            abi: SetToken,
            address: set,
            functionName: "decimals",
          },
          {
            abi: SetToken,
            address: set,
            functionName: "getComponents",
          },
        ])
        .flat();
      setContracts(newContracts);
    }
  }, [sets]);

  // Fetch properties for all sets
  const {
    data: setProperties,
    isError: isErrorSetProperties,
    isLoading: isLoadingSetProperties,
  } = useReadContracts({
    contracts
  });

  function moveDecimal(number1: number, number2: number): number {
    // Move the decimal by dividing the first number by 10 raised to the power of the second number
    let result = number1 / Math.pow(10, number2);
    // Round to two decimal places
    result = Math.round(result * 100) / 100;
    return result;
  }

  function parseBigInt(value: unknown): number {
    if (typeof value === 'bigint') {
      return Number(value);
    } else if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    } else {
      return 0;
    }
  }

  return (
    <div className="verticalStack">
      {status !== 'connected' ? (
        <div className="connectButton">You are not logged in</div>
      ) : (
        <>
          {isLoadingSets ? (
            <p>Loading...</p>
          ) : isErrorSets ? (
            <p>Error loading sets data</p>
          ) : (
            (sets as `0x${string}`[]).map((set, index: number) => (
              <Link className='link' to={`/set/${set}`} key={index}>
                <div className="propertyCard">
                  <div className="propertyRow">
                    <span className="propertyLabel">Set address:</span>
                    <span className="propertyValue">{set}</span>
                  </div>
                  <div className="propertyRow">
                    <span className="propertyLabel">Token Name:</span>
                    <span className="propertyValue">
                      {setProperties && setProperties.length > index * 5
                        ? `${setProperties[index * 5].result}`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="propertyRow">
                    <span className="propertyLabel">Token Symbol:</span>
                    <span className="propertyValue">
                      {setProperties && setProperties.length > index * 5 + 1
                        ? `${setProperties[index * 5 + 1].result}`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="propertyRow">
                    <span className="propertyLabel">Supply:</span>
                    <span className="propertyValue">
                      {setProperties && setProperties.length > index * 5 + 2 && setProperties.length > index * 5 + 3
                        ? `${moveDecimal(parseBigInt(setProperties[index * 5 + 2].result), parseBigInt(setProperties[index * 5 + 3].result))}`
                        : "Loading..."}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}

          <p>
            {isLoadingSetProperties
              ? "Loading properties..."
              : isErrorSetProperties
              ? "Error loading properties data"
              : ""}
          </p>
        </>
      )}
    </div>
  );
}

export default Indexes;
