import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./constants/constants";

const app = initializeApp(FIREBASE_CONFIG);

const db = getFirestore(app);

export const createCandidate = async ({
  address,
  name,
  image,
  denomination,
}) => {
  try {
    console.log(`Creating candidate in firestore...`);
    const result = await addDoc(collection(db, "candidates"), {
      name,
      address,
      image,
      denomination,
    });

    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getAllCandidates = async () => {
  const candidates = [];
  const query = await getDocs(collection(db, "candidates"));

  query.forEach((doc) => {
    candidates.push(doc.data());
  });

  console.log({ candidates });

  return candidates;
};
