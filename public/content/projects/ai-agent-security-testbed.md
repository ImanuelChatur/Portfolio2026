---
title: AI Coding Agent Security Testbed
date: 2026-09-01
summary: A prompt-injection testbed that scores whether AI coding agents introduce or catch OWASP-style vulnerabilities.
tags: [Flask, Docker, AI Security, OWASP]
featured: true
---

## Overview
A Flask application built to evaluate how AI coding agents respond to prompt injection and planted vulnerabilities.

## What I built
- Authentication and authorization layer: session login, CSRF protection, role-based admin access with audit logging, and hashed bearer API tokens
- A vulnerability-injection pipeline where each OWASP-style flaw is planted as an isolated patch over a hardened baseline, so agent behaviour can be scored per vulnerability
- Evaluation of agent patches using hidden exploit tests inside network-disabled Docker containers
