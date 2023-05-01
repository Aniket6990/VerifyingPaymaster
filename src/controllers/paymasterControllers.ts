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
    process.env.PROVIDER as string
  );
  // const ethersSigner = provider.getSigner();
  const ethersSigner = new ethers.Wallet(
    process.env.PVT_KEY as string,
    provider
  );
  const entryPoint = EntryPoint__factory.connect(
    process.env.ENTRY_POINT as string,
    ethersSigner
  );
  console.log(`entrypoint address: ${entryPoint.address}`);
  const offchainSigner = new ethers.Wallet(process.env.PVT_KEY as string);
  const paymaster = VerifyingPaymaster__factory.connect(
    process.env.PAYMASTER as string,
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
    },
    offchainSigner,
    entryPoint
  );
  console.log(`paymaster: ${paymaster.address}`);
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
  const result = await signUserOp(parsedUserOp);
  res.status(200).json({ result: result });
};
