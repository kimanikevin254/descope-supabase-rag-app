# Build a RAG App With Descope, Supabase, and pgvector

This repository contains the code for the [Descope](https://www.descope.com/) series titled "How to Build a RAG App With Descope, Supabase, and pgvector".

This article demonstrates how to build a Retrieval-Augmented Generation (RAG) application that combines the power of a language model with a knowledge base for accurate and contextually relevant responses. By leveraging tools like Descope, Supabase, and pgvector, the application provides secure login, embedding storage, and retrieval capabilities to enhance the user experience.

## Tools Used

-   **Supabase**: To set up a reliable backend infrastructure.
-   **pgvector**: For vector similarity search, enabling fast and accurate retrieval of context-relevant documents from the knowledge base.
-   **Descope**: As the Identity Provider(IdP) for Supabase to enable SSO.
-   **OpenAI**: To generate context-aware responses based on retrieved documents.
-   **Transformers.js**: To generate embeddings.

## Project Structure

This project is organized into two main parts:

-   **backend**: Includes setting up the Supabase database, enabling pgvector, creating database functions for similarity search.
-   **Frontend**: Focuses on integrating Descope as an identity provider, enabling RLS in SUpabase and building the user interface.
