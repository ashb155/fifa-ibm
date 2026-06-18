# Langflow Setup for Stratos

Since Langflow is a visual builder, build this simple flow:

1. **Chat Input**: Takes user's message.
2. **Prompt Template**:
   ```text
   User Context: Knowledge Level: {knowledge_level}, Language: {language}
   Rules/Match Data: {context}
   
   Explain the following event or rule to the user based on their context.
   Query: {query}
   ```
3. **ContextForge MCP Tool**: 
   - Add the `MCP Tool` node.
   - Point the URL to your local ContextForge gateway (e.g., `http://localhost:8000`).
   - Connect it to the Prompt Template `{context}` variable.
4. **IBM Granite**:
   - Add a `watsonx.ai` or `Ollama` node.
   - Set Model to `granite-3.1-8b-instruct`.
   - Connect the Prompt Template to the LLM input.
5. **Chat Output**: Displays the localized explanation.
