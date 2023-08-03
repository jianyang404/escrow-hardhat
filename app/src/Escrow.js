import styles from "./App.module.css";
import { ethers } from "ethers";
import EscrowArtifact from "./artifacts/contracts/Escrow.sol/Escrow";

export async function approve(escrowContract, signer) {
  try {
    const approveTxn = await escrowContract.connect(signer).approve();
    await approveTxn.wait();
  } catch (err) {
    console.log(err);
  }
}

const Escrow = ({ Parse, address, arbiter, beneficiary, value, signer }) => {
  const handleApprove = async () => {
    const escrowContract = new ethers.Contract(
      address,
      EscrowArtifact.abi,
      signer
    );

    escrowContract.on("Approved", async () => {
      document.getElementById(escrowContract.address).className = "complete";
      document.getElementById(escrowContract.address).innerText =
        "✓ It's been approved!";

      const Contract = Parse.Object.extend("Contracts");
      const query = new Parse.Query(Contract);

      query.equalTo("address", address);
      const [result] = await query.find();

      await result.destroy();
    });

    await approve(escrowContract, signer);
  };

  return (
    <div className={styles["existing-contract"]}>
      <ul>
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {ethers.utils.formatEther(value).toString()} </div>
        </li>
      </ul>
      <div
        className={styles.button}
        id={address}
        onClick={(e) => {
          e.preventDefault();

          handleApprove();
        }}
      >
        Approve
      </div>
    </div>
  );
};

export default Escrow;
