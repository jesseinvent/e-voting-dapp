import Web3Modal from "web3modal";
import { BrowserProvider, Contract, ethers, JsonRpcSigner } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./constants/constants";
import { Chart } from "chart.js/auto";
import { createCandidate, getAllCandidates } from "./firestore";
import Web3 from "web3";

const connectWalletButton = document.querySelector(
  "#connect-wallet"
) as Element;

const voteCandidatesPage = document.querySelector(
  "#voteCandidatesPage"
) as Element;

const registerCandidateButton = document.querySelector(
  "#registerCandidateButton"
) as Element;

const registerVoterButton = document.querySelector(
  "#registerVoterButton"
) as Element;

const candateAddressField = document.querySelector(
  "#candateAddressField"
) as any;

const candateNameField = document.querySelector("#candateNameField") as any;

const candateImageField = document.querySelector("#candateImageField") as any;

const candateDenominationField = document.querySelector(
  "#candateDenominationField"
) as any;

const voterAddressField = document.querySelector("#voterAddressField") as any;

const walletAddress = document.querySelector("#wallet-address") as Element;

const startVoteButton = document.querySelector("#startVoteButton") as Element;

const candidatesList = document.querySelector("#candidatesList");

const candidatesVotesList = document.querySelector("#candidatesVotesList");

const votersList = document.querySelector("#votersList");

const generateAddressButton = document.querySelector("#generateAddressButton");

const addressField = document.querySelector("#address");

const chartCtx = document.querySelector("#myChart") as HTMLCanvasElement;

let voterAddress: string;
let contract: Contract;
let signer: JsonRpcSigner | null | undefined;

let candidatesAddress = []; // chart
let candidateVotes = []; // chart

function handleError(error: any) {
  console.error(error);
  if (error.reason) {
    alert(`Error: ${error.reason}`);
  } else {
    // alert("An error occured, request could not completed.");
  }
}

const listenForEvents = async (window: any) => {
  try {
    window.ethereum.on("Vote", (data) => {
      console.log(data);
    });

    window.ethereum.on("message", (data) => {
      console.log(data);
    });

    // const instance = Web;

    console.log("Listening for events...");
  } catch (error) {
    console.error(error);
  }
};

const generateAddress = async () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  } catch (error) {
    console.error(error);
  }
};

const initializeSmartContract = async () => {
  try {
    const votingContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    votingContract.on("Vote", (voter, candidate) => {
      console.log(`Vote: ${voter}, ${candidate}`);
    });

    // votingContract.on("Vote", (data) => {
    //   console.log(data);
    // });

    contract = votingContract;

    console.log("Smart contract initialized");
    return true;
  } catch (error) {
    console.error(error);
  }
};

const getProvider = async (window: any) => {
  try {
    const metaMaskIsEnabled = window.ethereum.isMetaMask;

    if (!metaMaskIsEnabled) {
      alert("Please enable and setup metamask on your browser.");
    }

    console.log("MetaMask Detected.");

    const web3modal = new Web3Modal({
      network: "testnet",
      cacheProvider: true,
      providerOptions: {},
    });

    const result = await web3modal.connect();

    const provider = new BrowserProvider(result);

    signer = await provider.getSigner();
    // Get Wallet address
    voterAddress = await signer.getAddress();

    if (walletAddress) walletAddress.innerHTML = `<b>${voterAddress}</b>`;

    console.log("Wallet connected!");

    await initializeSmartContract();

    return true;
  } catch (error) {
    console.error(error);
    alert("An error occured, could not connect to your metamask wallet.");
  }
};

const vote = async (candidateAddress: string) => {
  try {
    if (!signer) {
      return alert("Please connect your wallet before voting...");
    }
    console.log(`Voting ${candidateAddress}`);

    const tx = await contract.vote(candidateAddress);
    const result = await tx.wait();
    console.log(result);

    alert("Vote successfully submitted");
  } catch (error) {
    handleError(error);
  }
};

const registerCandidate = async (
  candidateAddress: string,
  name: string,
  image: string,
  denomination: string
) => {
  try {
    console.log(`Registering candidate ${candidateAddress} ...`);

    if (!ethers.isAddress(candidateAddress)) {
      return alert("Candidate Address supplied is invalid!");
    }

    const tx = await contract.registerCandidate(candidateAddress);

    const result = await tx.wait();
    console.log(result);

    createCandidate({
      address: candidateAddress,
      name,
      image,
      denomination,
    });

    alert("Candidate address successfully registered!");
  } catch (error) {
    handleError(error);
  }
};

const getCandidates = async () => {
  try {
    const result = await contract.getCandidates();

    return result;
  } catch (error) {
    handleError(error);
  }
};

const setElectionCandidates = async () => {
  try {
    const candidates = await getAllCandidates();

    if (candidates.length < 1) {
      voteCandidatesPage.innerHTML = `<h5>No Election candidate registered...</h5>`;
    }

    candidates.forEach((candidate) => {
      const el1 = document.createElement("div");
      el1.className = "candidate card p-2 m-2";

      const el2 = document.createElement("div");
      el2.className = "d-flex align-items-center justify-content-around";
      el2.innerHTML = `
      <div>
      <h4>${candidate.name}</h4>
      <img
        src="${candidate.image}"
        class="candidate-image img-fluid py-1"
        alt=""
      />
      <p>
        Political Party: <span><b>${candidate.denomination}</b></span>
      </p>
    </div>

    <div>
    <p>
      Address:
      <span><b>${candidate.address}</b></span>
    </p>

    <div>
      <button
        class="vote-button btn btn-primary p-2 my-2"
        id="voteButton"
        value="${candidate.address}"
      >
        Vote
      </button>
    </div>
  </div>
      `;

      el1.appendChild(el2);
      voteCandidatesPage.appendChild(el1);
    });
  } catch (error) {
    handleError(error);
  }
};

const setCandidatesList = async () => {
  try {
    console.log("Fetching candidates...");

    const candidates = (await getCandidates()) as string[];

    if (!candidates || candidates.length == 0) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `No candidates registered...`;

      candidatesList.appendChild(li);
      return true;
    }

    candidates.forEach((candidate) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = candidate;

      candidatesList.appendChild(li);
    });
  } catch (error) {
    handleError(error);
  }
};

const setCandidatesVotesList = async () => {
  try {
    console.log("Fetching candidates list...");

    const candidates = (await getAllCandidates()) as any[];
    ``;

    console.log({ candidates });

    if (!candidates || candidates.length == 0) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `No canidates registered...`;

      candidatesVotesList.appendChild(li);
      return true;
    }

    await Promise.all(
      candidates.map(async (candidate) => {
        const votes = await getCandidateVotes(candidate.address);

        const li = document.createElement("li");
        li.textContent = `${candidate.name}: ${votes ?? 0}`;
        li.className = "list-group-item";
        candidatesVotesList.appendChild(li);

        candidatesAddress.push(candidate.name);
        candidateVotes.push(votes);
      })
    );
  } catch (error) {
    handleError(error);
  }
};

const setVotersList = async () => {
  try {
    console.log("Fetching voters...");

    const voters = (await getVoters()) as string[];

    if (!voters || voters.length == 0) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `No voters registered...`;

      votersList.appendChild(li);
      return true;
    }

    voters.forEach((voter) => {
      console.log(voter);

      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = voter;

      votersList.appendChild(li);
    });
  } catch (error) {
    handleError(error);
  }
};

const registerVoter = async (voterAddress: string) => {
  try {
    console.log(`Registering voter ${voterAddress} ...`);

    if (!ethers.isAddress(voterAddress)) {
      return alert("Voter Address supplied is invalid!");
    }

    const tx = await contract.registerVoter(voterAddress);

    const result = await tx.wait();
    console.log(result);

    alert("Voter address successfully registered!");
  } catch (error) {
    handleError(error);
  }
};

const getVoters = async () => {
  try {
    const result = await contract.getVoters();

    return result;
  } catch (error) {
    handleError(error);
  }
};

const setVoteStatus = async () => {
  try {
    const tx = await contract.setStatus();
    const result = await tx.wait();

    console.log(result);
    alert("Voting process successfully started");
  } catch (error) {
    handleError(error);
  }
};

const getCandidateVotes = async (candidateAddress: string) => {
  try {
    const tx = await contract.getVotesCount(candidateAddress);

    const votes = tx.toString();

    return votes;
  } catch (error) {
    handleError(error);
  }
};

// EventListeners
window.addEventListener("DOMContentLoaded", async () => {
  if (!signer) {
    await getProvider(window);
  }

  if (connectWalletButton)
    connectWalletButton.addEventListener("click", () => {
      getProvider(window);
    });

  if (voteCandidatesPage) {
    setElectionCandidates();
    voteCandidatesPage.addEventListener("click", async (e: any) => {
      if (e.target.id == "voteButton") {
        await vote(e.target.value);
      }
    });
  }

  if (registerCandidateButton)
    registerCandidateButton.addEventListener("click", async (e) => {
      e.preventDefault();
      if (candateAddressField.value == "") {
        return alert("Please enter candidate address.");
      }
      await registerCandidate(
        candateAddressField.value,
        candateNameField.value,
        candateImageField.value,
        candateDenominationField.value
      );

      candateAddressField.value = "";
      candateNameField.value = "";
      candateImageField.value = "";
      candateDenominationField.value = "";
    });

  if (registerVoterButton)
    registerVoterButton.addEventListener("click", async () => {
      if (voterAddressField.value == "") {
        return alert("Please enter voter address.");
      }
      await registerVoter(voterAddressField.value);

      voterAddressField.value = "";
    });

  if (startVoteButton)
    startVoteButton.addEventListener("click", async () => {
      await setVoteStatus();
    });

  if (generateAddressButton)
    generateAddressButton.addEventListener("click", async () => {
      const address = await generateAddress();

      addressField.textContent = address;

      alert("Address successfully generated.");
    });

  if (candidatesList) await setCandidatesList();

  if (votersList) await setVotersList();

  if (candidatesVotesList) {
    await setCandidatesVotesList();

    if (candidatesAddress.length > 0)
      new Chart(chartCtx, {
        type: "bar",
        data: {
          labels: candidatesAddress,
          datasets: [
            {
              label: "Number of votes of Votes",
              data: candidateVotes,
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
  }

  listenForEvents(window);
});
