import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
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
  return c.json({ status: "ok" });
});

// ==================== PROPERTIES ENDPOINTS ====================

// Get all properties
app.get("/make-server-4868b0da/properties", async (c) => {
  try {
    const properties = await kv.getByPrefix("property:");
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
    const property = await kv.get(`property:${id}`);

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

    // Get current counter and increment
    let counter = await kv.get("counter:properties");
    const newId = (counter || 0) + 1;
    await kv.set("counter:properties", newId);

    const property = {
      id: String(newId),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`property:${newId}`, property);
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

    const existing = await kv.get(`property:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Property not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`property:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log("Error updating property:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete property
app.delete("/make-server-4868b0da/properties/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const existing = await kv.get(`property:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Property not found" }, 404);
    }

    await kv.del(`property:${id}`);
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
    const leads = await kv.getByPrefix("lead:");
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

    // Get current counter and increment
    let counter = await kv.get("counter:leads");
    const newId = (counter || 0) + 1;
    await kv.set("counter:leads", newId);

    const lead = {
      id: String(newId),
      ...body,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`lead:${newId}`, lead);
    return c.json({ success: true, data: lead }, 201);
  } catch (error) {
    console.log("Error creating lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);