"""
PATCH for main.py — Add streak API routes.

Insert these routes after the existing credit routes (around line 3701).
No new imports needed — streak_manager is self-contained.
"""


@app.route("/api/v1/streak/login", methods=["POST"])
@limiter.limit("10 per minute")
@require_auth
def streak_login():
    """Record daily login and return streak info + optional bonus."""
    user = g.current_user
    user_id = user.get("sub", "")

    from backend.streak import streak_manager
    result = streak_manager.record_login(user_id)

    # If milestone reached, auto-claim the bonus
    if result.get("streak_milestone_reached"):
        milestone_days = result.get("milestone_days", 0)
        claim_result = streak_manager.claim_bonus(user_id, milestone_days)
        if claim_result.get("bonus_credits"):
            result["bonus_credits"] = claim_result["bonus_credits"]
            result["new_balance"] = claim_result.get("new_balance")

    return jsonify(result)


@app.route("/api/v1/streak/info", methods=["GET"])
@require_auth
def streak_info():
    """Get current streak info for the logged-in user."""
    user = g.current_user
    user_id = user.get("sub", "")

    from backend.streak import streak_manager
    info = streak_manager.get_info(user_id)
    return jsonify(info)


@app.route("/api/v1/streak/claim", methods=["POST"])
@require_auth
def streak_claim():
    """Manually claim a streak milestone bonus."""
    user = g.current_user
    user_id = user.get("sub", "")
    data = request.get_json(silent=True) or {}
    streak_days = data.get("streak_days", 0)

    if not streak_days or streak_days <= 0:
        return jsonify({"error": "Missing streak_days"}), 400

    from backend.streak import streak_manager
    result = streak_manager.claim_bonus(user_id, streak_days)

    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)
