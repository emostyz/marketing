import io
import base64
import pandas as pd
import matplotlib.pyplot as plt
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import traceback
import sys

app = FastAPI()

class CodeRequest(BaseModel):
    code: str
    data_csv: str  # CSV as string

@app.post("/analyze")
def analyze(request: CodeRequest):
    try:
        # Load data
        df = pd.read_csv(io.StringIO(request.data_csv))
        # Prepare a safe namespace
        safe_globals = {"pd": pd, "df": df, "plt": plt, "io": io}
        safe_locals = {}
        # Run user code
        exec(request.code, safe_globals, safe_locals)
        # Collect results
        results = {}
        # If 'result' is set in code, return it
        if "result" in safe_locals:
            results["result"] = safe_locals["result"]
        # If a matplotlib figure was created, return as base64
        fig = plt.gcf()
        if fig.get_axes():
            buf = io.BytesIO()
            fig.savefig(buf, format="png", bbox_inches="tight")
            buf.seek(0)
            img_b64 = base64.b64encode(buf.read()).decode()
            results["chart"] = img_b64
            plt.close(fig)
        return results
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e), "trace": traceback.format_exc()}) 