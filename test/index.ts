import { expect } from "chai";
import { ethers, run } from "hardhat";
import { deployContract } from "../scripts/utils";
import { King } from "../typechain/King";
import { Sender } from "../typechain/Sender";
import { SenderWithoutHandlingCallReturn } from "../typechain/SenderWithoutHandlingCallReturn";

async function verify(contractAddress: string) {
  return await run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });
}

describe("Greeter", function () {
  let kingContract: King;
  const contractsToVerify: string[] = [];

  this.timeout(120 * 1000);

  this.beforeEach(async () => {
    kingContract = (await deployContract("King")) as unknown as King;
    contractsToVerify.push(kingContract.address);
  });

  this.afterAll(async () => {
    console.log("Verifying contracts deployed...");
    await Promise.all(contractsToVerify.map(verify));
  });

  it("Sender claims kingship correctly", async function () {
    const sender = (await deployContract("Sender")) as unknown as Sender;
    await sender.deployed();
    contractsToVerify.push(sender.address);

    const sendTx = await sender.send(kingContract.address, {
      value: ethers.utils.parseEther("0.0000001"),
    });
    await sendTx.wait(5);

    expect(await kingContract._king()).to.equal(sender.address);
  });

  it("SenderWithoutHandlingCallReturn fails to claim kingship", async function () {
    const senderWithoutHandlingCallReturn = (await deployContract(
      "SenderWithoutHandlingCallReturn"
    )) as unknown as SenderWithoutHandlingCallReturn;

    await senderWithoutHandlingCallReturn.deployed();
    contractsToVerify.push(senderWithoutHandlingCallReturn.address);

    const sendTx = await senderWithoutHandlingCallReturn.send(
      kingContract.address,
      {
        value: ethers.utils.parseEther("0.0000001"),
      }
    );
    await sendTx.wait(5);

    expect(await kingContract._king()).to.not.equal(
      senderWithoutHandlingCallReturn.address
    );
  });
});
