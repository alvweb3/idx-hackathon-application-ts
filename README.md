# IDX V0 Front End Using Typescript
This is the source code of the IDX application using Typescript. It includes the front end and the smart contract integration.

You can check the live website at: https://idx-hackathon-application-ts.vercel.app/

# These are the steps to interact with:

1. Go to the Factory page. Select which tokens you want your new index to be made of, their weights, the index name and symbol.
2. Go to the Indexes page. Find the index you are interested in, and click on it.
3. Once you have selected an index, if you are the index creator, you must first intialize it (clicking the intialize button) to be able to issue/redeem tokens.
4. Now, everyone who owns the underlying tokens can issue the index token. They must first have to approve the smart contract to swap the tokens required (automatically calculated by the smart contract based on the index token amount the user wants to issue/redeem) to issue the index token.
5. Finally, issue or redeem index tokens as you please (as long as you have enough underlying tokens).