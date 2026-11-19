---
title: Bonker Banker
date: 2026-11-01
summary: A Flask web app that analyzes 1M+ transactions to estimate how long customers take to recover from financial shocks.
tags: [Flask, Google Gemini, AWS EC2, Docker, Caddy]
featured: true
---

## Overview
Analyzes over a million transactions to calculate customer financial-shock recovery timelines.

## Security
- Salted scrypt password hashing, CSRF tokens, and session-fixation protection
- Lockout after 5 failed logins per username and IP address, with constant-time comparisons to prevent username enumeration
- Account and card numbers are masked before bank statements are sent to Google Gemini, and uploaded PDFs are deleted immediately after parsing

## Deployment
Runs on AWS EC2 with Docker, with Caddy handling automatic TLS. Secrets are kept out of source control.
