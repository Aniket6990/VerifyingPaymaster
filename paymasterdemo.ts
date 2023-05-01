import { ContractReceipt, Wallet } from "ethers";
import { ethers } from "ethers";
import {
  SimpleAccount,
  EntryPoint,
  VerifyingPaymaster,
  VerifyingPaymaster__factory,
  EntryPoint__factory,
  SimpleAccountFactory__factory,
} from "./typechain";
import {
  createAccount,
  createAccountOwner,
  createAddress,
  deployEntryPoint,
  simulationResultCatch,
} from "./src/utils/testutils";
import { fillAndSign } from "./src/utils/UserOp";
import {
  arrayify,
  defaultAbiCoder,
  hexConcat,
  parseEther,
} from "ethers/lib/utils";
import { UserOperationEventEvent } from "./typechain/contracts/core/EntryPoint";
// import { UserOperation } from './UserOperation'

const MOCK_VALID_UNTIL = "0x00000000deadbeef";
const MOCK_VALID_AFTER = "0x0000000000001234";

const getUserOpEvent = async (ep: EntryPoint) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545/"
  );
  const [log] = await ep.queryFilter(
    ep.filters.UserOperationEvent(),
    await provider.getBlockNumber()
  );
  return log;
};

const PaymasterDataWithUserOp = async (): Promise<any> => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

  const offchainSigner = new ethers.Wallet(process.env.PVT_KEY as string);

  const signer = offchainSigner.connect(provider);
  // const ethersSigner = provider.getSigner();
  //   const entryPoint = await deployEntryPoint()
  const entryPoint = EntryPoint__factory.connect(
    process.env.ENTRY_POINT as string,
    offchainSigner
  );
  console.log(`entrypoint address: ${entryPoint.address}`);
  // const accountFactory = SimpleAccountFactory__factory.connect(
  //   "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  //   ethersSigner
  // );

  const accountOwner = new ethers.Wallet(process.env.PVT_KEY as string);
  const paymaster = await new VerifyingPaymaster__factory(signer).deploy(
    entryPoint.address,
    offchainSigner.address
  );
  // const paymaster = VerifyingPaymaster__factory.connect(
  //   "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  //   ethersSigner
  // );
  console.log(`paymaster address: ${paymaster.address}`);

  // add stake to entrypoint
  // await paymaster.callStatic.addStake(1000, { value: parseEther('2'), gasLimit: 6000000 })
  // await entryPoint.callStatic.depositTo(paymaster.address, { value: parseEther('1'), gasLimit: 6000000 })

  // create a smart contract account
  // const { proxy } = await createAccount(
  //   ethersSigner,
  //   accountOwner.address,
  //   entryPoint.address,
  //   accountFactory
  // );
  // const userOp1 = await fillAndSign(
  //   {
  //     sender: proxy.address,
  //     paymasterAndData: hexConcat([
  //       paymaster.address,
  //       defaultAbiCoder.encode(
  //         ["uint48", "uint48"],
  //         [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]
  //       ),
  //       "0x" + "00".repeat(65),
  //     ]),
  //   },
  //   offchainSigner,
  //   entryPoint
  // );
  // const hash = await paymaster.getHash(
  //   userOp1,
  //   MOCK_VALID_UNTIL,
  //   MOCK_VALID_AFTER
  // );
  // const sig = await offchainSigner.signMessage(arrayify(hash));
  // const userOp = await fillAndSign(
  //   {
  //     ...userOp1,
  //     paymasterAndData: hexConcat([
  //       paymaster.address,
  //       defaultAbiCoder.encode(
  //         ["uint48", "uint48"],
  //         [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]
  //       ),
  //       sig,
  //     ]),
  //   },
  //   offchainSigner,
  //   entryPoint
  // );
  // console.log(`userOp: ${JSON.stringify(userOp)}`);
  // const res = await entryPoint.callStatic
  //   .simulateValidation(userOp, { gasLimit: 6000000 })
  //   .catch(simulationResultCatch);
  // const ops = await entryPoint.handleOps([userOp], offchainSigner.address);
  // const success = await ops.wait();
  // return res;
};
// 0x7A8EA48e4a71964859dc22cDF4D9B995084b0c91
PaymasterDataWithUserOp()
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
