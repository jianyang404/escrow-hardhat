import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import styles from "./App.module.css";
import Parse from "parse";

Parse.initialize("1");
Parse.serverURL = "http://localhost:3001/parse";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const App = () => {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  const fetchContracts = async () => {
    try {
      const Contract = Parse.Object.extend("Contracts");
      const query = new Parse.Query(Contract);

      const results = await query.findAll();

      setEscrows(results.map((result) => result.attributes));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    async function getAccounts() {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);

        setAccount(accounts[0]);
        setSigner(provider.getSigner());
      } catch (err) {
        console.log(err);
      }
    }

    getAccounts();
    fetchContracts();
  }, [account]);

  async function newContract(evt) {
    evt.preventDefault();

    try {
      const beneficiary = document.getElementById("beneficiary").value;
      const arbiter = document.getElementById("arbiter").value;
      const value = ethers.utils.parseEther(
        document.getElementById("eth").value
      );
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);

      const Contract = Parse.Object.extend("Contracts");
      const contract = new Contract();

      contract.set("address", escrowContract.address);
      contract.set("arbiter", arbiter);
      contract.set("beneficiary", beneficiary);
      contract.set("value", value);

      await contract.save();

      fetchContracts();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contract}>
        <h1> New Contract</h1>

        <form onSubmit={newContract}>
          <label>
            Arbiter Address
            <input type="text" id="arbiter" required />
          </label>

          <label>
            Beneficiary Address
            <input type="text" id="beneficiary" required />
          </label>

          <label>
            Deposit Amount (in ETH)
            <input type="text" id="eth" required />
          </label>

          <button className={styles.button} type="submit" id="deploy">
            Deploy
          </button>
        </form>
      </div>

      <div className={styles["existing-contracts"]}>
        <h1> Existing Contracts </h1>

        <div id="container" className={styles["escrow-container"]}>
          {escrows.map((escrow) => {
            return (
              <Escrow
                key={escrow.address}
                {...escrow}
                signer={signer}
                Parse={Parse}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
