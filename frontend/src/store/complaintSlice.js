import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { extractComplaint, saveComplaint } from "../api/client";

const EMPTY_FORM = {
  complaint_source: "",
  customer_name: "",
  product_name: "",
  product_strength_grade: "",
  batch_lot_number: "",
  manufacturing_date: "",
  expiry_date: "",
  quantity_affected: "",
  complaint_type: "",
  complaint_date: "",
  description: "",
  severity: "",
  priority: "",
};

export const runExtraction = createAsyncThunk(
  "complaint/runExtraction",
  async (text, { rejectWithValue }) => {
    try {
      return await extractComplaint(text);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const persistComplaint = createAsyncThunk(
  "complaint/persistComplaint",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { form, insights } = getState().complaint;
      return await saveComplaint({ ...form, ...insights });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  form: EMPTY_FORM,
  insights: {
    completeness: null,
    risk_classification: null,
    root_cause: null,
    capa: null,
    ai_summary: null,
    extraction_confidence: null,
  },
  extractionStatus: "idle", // idle | loading | succeeded | failed
  extractionError: null,
  saveStatus: "idle",
  savedId: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    updateField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm(state) {
      state.form = EMPTY_FORM;
      state.insights = initialState.insights;
      state.extractionStatus = "idle";
      state.saveStatus = "idle";
      state.savedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runExtraction.pending, (state) => {
        state.extractionStatus = "loading";
        state.extractionError = null;
      })
      .addCase(runExtraction.fulfilled, (state, action) => {
        const data = action.payload;
        state.form = { ...state.form, ...data.complaint };
        state.form.severity = data.risk_classification?.severity ?? state.form.severity;
        state.form.priority = data.risk_classification?.priority ?? state.form.priority;
        state.insights = {
          completeness: data.completeness,
          risk_classification: data.risk_classification,
          root_cause: data.root_cause,
          capa: data.capa,
          ai_summary: data.ai_summary,
          extraction_confidence: data.extraction_confidence,
        };
        state.extractionStatus = "succeeded";
      })
      .addCase(runExtraction.rejected, (state, action) => {
        state.extractionStatus = "failed";
        state.extractionError = action.payload || "Extraction failed";
      })
      .addCase(persistComplaint.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(persistComplaint.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.savedId = action.payload.id;
      })
      .addCase(persistComplaint.rejected, (state) => {
        state.saveStatus = "failed";
      });
  },
});

export const { updateField, resetForm } = complaintSlice.actions;
export default complaintSlice.reducer;
