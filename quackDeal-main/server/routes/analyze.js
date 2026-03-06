const express = require('express');
const router = express.Router();
const { analyzeTranscript, analyzeImage } = require('../services/geminiService');
const { calculateDealHealth } = require('../services/dealHealthService');
const { saveMeeting, saveHealthScore, saveFollowUp } = require('../services/snowflakeService');
const { generateFollowUp } = require('../services/geminiService');

// POST /api/analyze
router.post('/', async (req, res) => {
  try {
    const { dealId, inputType, text, transcriptText, imageBase64, audioBase64, mediaType } = req.body;

    console.log('📥 Analyze request:', { dealId, inputType, textLength: (text || transcriptText)?.length });

    if (!dealId || !inputType) {
      return res.status(400).json({ error: 'dealId and inputType are required' });
    }

    const transcript = text || transcriptText;

    let geminiAnalysis;

    if (inputType === 'text') {
      // ── Plain text transcript ────────────────────────────
      if (!transcript) return res.status(400).json({ error: 'text is required for inputType text' });
      geminiAnalysis = await analyzeTranscript(transcript);

    } else if (inputType === 'image') {
      // ── Screenshot / image ───────────────────────────────
      if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required for inputType image' });
      geminiAnalysis = await analyzeImage(imageBase64, mediaType || 'image/png');

    } else if (inputType === 'audio') {
      // ── Audio: live recording transcript from browser ────
      // Audio file upload is not supported — Claude API only accepts PDF documents.
      // Live recording (Web Speech API) sends transcript as plain text.
      if (audioBase64) {
        return res.status(400).json({
          error: 'Audio file upload is not supported. Please use the live recording button to record your meeting instead.'
        });
      }
      if (!transcript) {
        return res.status(400).json({ error: 'No transcript found. Please use live recording and try again.' });
      }
      geminiAnalysis = await analyzeTranscript(transcript);

    } else {
      return res.status(400).json({ error: 'inputType must be text, image, or audio' });
    }

    // ── Calculate Deal Health Score ──────────────────────────
    const healthResult = calculateDealHealth({
      sentimentScore: geminiAnalysis.sentimentScore || 0,
      objections: geminiAnalysis.objections || [],
      commitmentSignals: geminiAnalysis.commitmentSignals || [],
      transcript: transcript || ''
    });

    // ── Save meeting to Snowflake ────────────────────────────
    const meetingId = `mtg_${Date.now()}`;
    try {
      await saveMeeting({
        meetingId,
        dealId,
        inputType,
        transcriptText: transcript || '',
        sentimentScore: geminiAnalysis.sentimentScore || 0,
        summary: geminiAnalysis.summary || '',
        objections: geminiAnalysis.objections || [],
        commitmentSignals: geminiAnalysis.commitmentSignals || [],
        actionItems: geminiAnalysis.actionItems || []
      });
    } catch (dbError) {
      console.warn('⚠️ saveMeeting failed (continuing):', dbError.message);
    }

    // ── Save health score to Snowflake ───────────────────────
    try {
      await saveHealthScore({
        dealId,
        meetingId,
        totalScore: healthResult.totalScore,
        breakdown: healthResult.breakdown
      });
    } catch (dbError) {
      console.warn('⚠️ saveHealthScore failed (continuing):', dbError.message);
    }

    res.json({
      meetingId,
      dealId,
      healthScore: healthResult.totalScore,
      healthLabel: healthResult.label,
      geminiAnalysis,
      scoreBreakdown: healthResult.breakdown
    });

  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analyze/followup
router.post('/followup', async (req, res) => {
  try {
    const {
      dealId = null,
      meetingId = null,
      clientName,
      clientCompany = '',
      healthScore,
      objections = [],
      commitmentSignals = [],
      nextBestAction = '',
      geminiAnalysis = null
    } = req.body;

    if (!clientName && !geminiAnalysis) {
      return res.status(400).json({ error: 'clientName or geminiAnalysis is required' });
    }

    const resolvedObjections    = objections.length > 0 ? objections : geminiAnalysis?.objections || [];
    const resolvedSignals       = commitmentSignals.length > 0 ? commitmentSignals : geminiAnalysis?.commitmentSignals || [];
    const resolvedNextAction    = nextBestAction || geminiAnalysis?.nextBestAction || '';

    const followUp = await generateFollowUp({
      clientName: clientName || 'Valued Client',
      clientCompany,
      healthScore,
      objections: resolvedObjections,
      commitmentSignals: resolvedSignals,
      nextBestAction: resolvedNextAction
    });

    const followUpId = `fu_${Date.now()}`;
    try {
      await saveFollowUp({
        followUpId,
        dealId: dealId || 'unknown',
        meetingId: meetingId || 'unknown',
        subject: followUp.subject || '',
        body: followUp.body || ''
      });
    } catch (dbError) {
      console.warn('⚠️ saveFollowUp failed (continuing):', dbError.message);
    }

    res.json({
      followUpId,
      subject: followUp.subject,
      body: followUp.body,
      email: { subject: followUp.subject, body: followUp.body }
    });

  } catch (error) {
    console.error('❌ Follow-up error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
