import { ethers } from "ethers";
import {
  VerifyingPaymaster__factory,
  EntryPoint__factory,
} from "../../typechain";
import { fillAndSign } from "../../src/utils/UserOp";
import { arrayify, defaultAbiCoder, hexConcat } from "ethers/lib/utils";
import { UserOperation } from "../utils/UserOperation";
import { simulationResultCatch } from "../utils/testutils";

const MOCK_VALID_UNTIL = "0x00000000deadbeef";
const MOCK_VALID_AFTER = "0x0000000000001234";

const signUserOp = async (UserOp: UserOperation): Promise<UserOperation> => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545/"
  );
  const ethersSigner = provider.getSigner();
  const entryPoint = EntryPoint__factory.connect(
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    ethersSigner
  );
  console.log(`entrypoint address: ${entryPoint.address}`);
  const offchainSigner = new ethers.Wallet(
    "a279717e8b02d2e054174b8b2c4732008865f01720eda8c8c423b3c6f5cbe9cd"
  );
  const paymaster = VerifyingPaymaster__factory.connect(
    "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
    ethersSigner
  );
  const userOp1 = await fillAndSign(
    {
      sender: UserOp.sender,
      initCode: UserOp.initCode,
      nonce: UserOp.nonce,
      callData: UserOp.callData,
      callGasLimit: UserOp.callGasLimit,
      maxFeePerGas: UserOp.maxFeePerGas,
      maxPriorityFeePerGas: UserOp.maxPriorityFeePerGas,
      preVerificationGas: UserOp.preVerificationGas,
      verificationGasLimit: UserOp.verificationGasLimit,
      signature: UserOp.signature,
      paymasterAndData: hexConcat([
        paymaster.address,
        defaultAbiCoder.encode(
          ["uint48", "uint48"],
          [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]
        ),
        "0x" + "00".repeat(65),
      ]),
    },
    offchainSigner,
    entryPoint
  );
  const hash = await paymaster.getHash(
    userOp1,
    MOCK_VALID_UNTIL,
    MOCK_VALID_AFTER
  );
  console.log(`hash: ${hash}`);
  const sig = await offchainSigner.signMessage(arrayify(hash));
  const userOp = await fillAndSign(
    {
      ...userOp1,
      paymasterAndData: hexConcat([
        paymaster.address,
        defaultAbiCoder.encode(
          ["uint48", "uint48"],
          [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]
        ),
        sig,
      ]),
    },
    offchainSigner,
    entryPoint
  );
  return userOp;
};

export const getPaymasterAndData = async (req: any, res: any) => {
  const UserOp: string = req.body;
  const parsedUserOp: UserOperation = JSON.parse(JSON.stringify(UserOp));
  console.log(`gotUserOp: ${JSON.stringify(parsedUserOp)}`);
  const result = await signUserOp(parsedUserOp);
  console.log(`result: ${JSON.stringify(result)}`);
  res.status(200).json({ result: result });
};
