export const FLOOR_PLAN_PROMPT = `TASK: Convert the input 2D floor plan into a photorealistic, top-down 3D architectural render, AND return a small JSON summary with room counts and total area.

STRICT REQUIREMENTS (do not violate):
1) REMOVE ALL TEXT: Do not render letters, numbers, labels, dimensions, or annotations.
2) GEOMETRY MUST MATCH: Walls, rooms, doors, and windows must follow the exact lines and positions.
3) TOP-DOWN ONLY: Orthographic top-down view. No perspective tilt.
4) CLEAN, REALISTIC OUTPUT: Crisp edges, balanced lighting, realistic materials.
5) NO EXTRA CONTENT: Do not add rooms, furniture, or objects not clearly indicated by the plan.

STRUCTURE & DETAILS:
- Walls: Extrude precisely from plan lines. Consistent height (2.8m) and thickness (0.15m).
- Doors: Convert door swing arcs into open doors aligned to the plan.
- Windows: Convert thin perimeter lines into realistic glass windows.

FURNITURE MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → bed (dimensions ~1.6 x 2.0m)
- Sofa icon → sofa (dimensions ~2.2 x 0.9m)
- Dining table icon → table (dimensions ~1.5 x 0.8m)
- Kitchen → counters with sink and stove
- Bathroom → toilet, sink, and tub/shower
- Office → desk (~1.4 x 0.7m) and chair
- Washer/dryer → washer (~0.6 x 0.6m)

TEXTURES & MATERIALS:
- Hardwood floors in living areas and bedrooms
- Tile in kitchens and bathrooms
- Carpet in defined lounge areas
- White or off-white painted walls (#F5F5F0)
- Matte ceiling finish

============================================================
JSON SUMMARY — MANDATORY, NEVER OMIT EITHER FIELD
============================================================

Alongside the rendered image, return a small JSON object with EXACTLY these two fields:

{
  "rooms": [
    { "type": "bedroom" },
    { "type": "bathroom" },
    { "type": "kitchen" }
  ],
  "total_area_sqm": 85.4
}

RULES FOR "rooms":
- One entry per distinct room visible in the plan.
- "type" must be one of: "bedroom", "bathroom", "kitchen", "living_room", "dining_room", "balcony", "study", "hallway", "other".
- Do not include extra keys (no id, label, dimensions, furniture).

RULES FOR "total_area_sqm":
- Always return a positive number, never null, never "unknown".
- If the plan has labeled dimensions (e.g., "14'-0\\" x 15'-0\\"" or "Carpet area = 450 sq ft"), READ them and compute the total.
  - Convert feet to meters (1 ft = 0.3048 m, 1 sq ft = 0.0929 sqm).
- If no dimensions are labeled, ESTIMATE using furniture as a scale reference:
  - bed = 1.6 × 2.0m, sofa = 2.2 × 0.9m, dining table = 1.5 × 0.8m, bathtub = 1.7 × 0.7m
  - Measure rooms in pixels relative to these known-size objects, then sum.
- When in doubt, give your best estimate — never omit this field.

OUTPUT FORMAT: Return ONLY valid JSON for the text part (no markdown, no backticks, no explanation outside JSON), plus the rendered image.`;
