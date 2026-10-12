import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as mongodb from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4868b0da/health", (c) => {
  return c.json({ status: "ok", database: "MongoDB Atlas" });
});

// ==================== PROPERTIES ENDPOINTS ====================

// Get all properties
app.get("/make-server-4868b0da/properties", async (c) => {
  try {
    const properties = await mongodb.getAllProperties();
    return c.json({ success: true, data: properties || [] });
  } catch (error) {
    console.log("Error fetching properties:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single property by ID
app.get("/make-server-4868b0da/properties/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const property = await mongodb.getProperty(id);

    if (!property) {
      return c.json({ success: false, error: "Property not found" }, 404);
    }

    return c.json({ success: true, data: property });
  } catch (error) {
    console.log("Error fetching property:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new property
app.post("/make-server-4868b0da/properties", async (c) => {
  try {
    const body = await c.req.json();
    const id = await mongodb.createProperty(body);
    const property = await mongodb.getProperty(id.toString());
    return c.json({ success: true, data: property }, 201);
  } catch (error) {
    console.log("Error creating property:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update property
app.put("/make-server-4868b0da/properties/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const existing = await mongodb.getProperty(id);
    if (!existing) {
      return c.json({ success: false, error: "Property not found" }, 404);
    }

    const updated = await mongodb.updateProperty(id, body);
    if (!updated) {
      return c.json({ success: false, error: "Failed to update property" }, 500);
    }

    const property = await mongodb.getProperty(id);
    return c.json({ success: true, data: property });
  } catch (error) {
    console.log("Error updating property:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete property
app.delete("/make-server-4868b0da/properties/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const existing = await mongodb.getProperty(id);
    if (!existing) {
      return c.json({ success: false, error: "Property not found" }, 404);
    }

    const deleted = await mongodb.deleteProperty(id);
    if (!deleted) {
      return c.json({ success: false, error: "Failed to delete property" }, 500);
    }

    return c.json({ success: true, message: "Property deleted" });
  } catch (error) {
    console.log("Error deleting property:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== LEADS ENDPOINTS ====================

// Get all leads
app.get("/make-server-4868b0da/leads", async (c) => {
  try {
    const leads = await mongodb.getAllLeads();
    return c.json({ success: true, data: leads || [] });
  } catch (error) {
    console.log("Error fetching leads:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new lead
app.post("/make-server-4868b0da/leads", async (c) => {
  try {
    const body = await c.req.json();
    const id = await mongodb.createLead(body);
    const leadCollection = await mongodb.getLeadsCollection();
    const lead = await leadCollection.findOne({ _id: id });
    return c.json({ success: true, data: lead }, 201);
  } catch (error) {
    console.log("Error creating lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);