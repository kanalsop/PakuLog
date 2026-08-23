# ADR-0003: Use a modular Next.js and Supabase application

- Status: Accepted
- Date: 2026-08-24

In the context of an MVP that records personal meals today and may recognize food photographs in
the future, facing the need to ship a simple web application without coupling future recognition
workloads to the user interface or persistence model, we decided for a feature-oriented Next.js
modular monolith with Supabase behind adapters and a replaceable recognition-provider boundary and
against an initial microservice architecture or direct provider calls from components, to keep the
MVP deployable while preserving an extraction path for recognition workers, accepting that a
future workload split will require a new deployment boundary and a superseding decision.
