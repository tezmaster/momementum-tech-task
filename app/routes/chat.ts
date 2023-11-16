import express from "express";

interface CompanyData {
  chatApp: string;
  hasDrift: boolean;
  hasSalesForce: boolean;
  companyName: string;
}

const router = express.Router();

router.post("/drift", async (req, res) => {
  try {
    const data = (req as any).cachedData;
    const filteredData = data.filter((item: CompanyData) => {
      return item.hasDrift;
    });

    res.json(filteredData);
  } catch (error) {
    console.error("Error processing chat data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/salesForce", async (req, res) => {
  try {
    const data = (req as any).cachedData;
    const filteredData = data.filter((item: CompanyData) => {
      return item.hasSalesForce;
    });

    res.json(filteredData);
  } catch (error) {
    console.error("Error processing chat data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to find chat information
router.post("/find", (req, res) => {
  try {
    const data = (req as any).cachedData;
    const { companyName, hasDrift, hasSalesForce } = req.query;

    // Filter the data based on query parameters
    const filteredData = data.filter((item: CompanyData) => {
      if (
        companyName &&
        !item.companyName
          .toLowerCase()
          .includes((companyName as string).toLowerCase())
      ) {
        return false;
      }

      if (hasDrift && !item.hasDrift) {
        return false;
      }

      if (hasSalesForce && !item.hasSalesForce) {
        return false;
      }

      return true;
    });

    res.json(filteredData);
  } catch (error) {
    console.error("Error processing chat data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
