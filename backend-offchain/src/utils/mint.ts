import { Lucid, Blockfrost } from "@lucid-evolution/lucid";
import "dotenv/config"

const API_KEY = process.env.BLOCKFROST_API_KEY!;
const NETWORK = process.env.NETWORK || "Mainnet";

export async function mintNFT(
  walletPrivateKey: string,
  receiverAddress: string,
  metadata: {
    name: string;
    image: string; // IPFS link or hosted image
    description: string;
  }
) {
  const lucid = await Lucid(
    new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", API_KEY),
    "Preprod"
  );
//how to connect testnet to blockfrost
  await lucid.selectWalletFromPrivateKey(walletPrivateKey);

  const policy = lucid.utils.nativeScriptFromJson({
    type: "sig",
    keyHash: lucid.utils.keyHash(await lucid.wallet.address()),
  });

  const policyId = lucid.utils.scriptHash(policy);

  const assetName = metadata.name;
  const unit = policyId + fromText(assetName);

  const tx = await lucid
    .newTx()
    .mintAssets({ [unit]: 1n }, Data.void())
    .attachMetadata(721, {
      [policyId]: {
        [assetName]: {
          name: metadata.name,
          image: metadata.image,
          description: metadata.description,
        },
      },
    })
    .validTo(Date.now() + 100000)
    .attachMintingPolicy(policy)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();

  return txHash;
}
