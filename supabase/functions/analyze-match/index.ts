import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { matchId } = await req.json()
    
    if (!matchId) {
      throw new Error('Match ID is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the match data
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (matchError) throw matchError

    console.log('Analyzing match:', matchId)

    // Call Lovable AI to analyze the match
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert eSports coach analyzing competitive gaming match data. Provide actionable, specific feedback based on the match statistics provided.'
          },
          {
            role: 'user',
            content: `Analyze this ${match.game_type} match data and provide:
1. A brief summary of the match performance
2. 3-5 key mistakes that affected the outcome
3. 3-5 specific improvement tips
4. A 3-step strategic plan for the next match
5. An overall performance score (0-100)

Match Data: ${JSON.stringify(match.raw_data)}

Respond in JSON format with keys: summary, mistakes (array of strings), tips (array of strings), strategic_plan (array of objects with "step" and "description"), performance_score (number).`
          }
        ]
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI analysis failed: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices[0].message.content
    
    // Parse the AI response
    let analysis
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        analysis = JSON.parse(content)
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      // Fallback analysis
      analysis = {
        summary: content.substring(0, 500),
        mistakes: ['Unable to parse specific mistakes'],
        tips: ['Review the match replay', 'Focus on fundamentals', 'Practice positioning'],
        strategic_plan: [
          { step: 1, description: 'Review this analysis' },
          { step: 2, description: 'Practice identified weaknesses' },
          { step: 3, description: 'Apply learnings in next match' }
        ],
        performance_score: 65
      }
    }

    // Store the analysis
    const { data: analyticsData, error: analyticsError } = await supabaseClient
      .from('analytics')
      .insert({
        match_id: matchId,
        user_id: match.user_id,
        ai_summary: analysis.summary,
        key_mistakes: analysis.mistakes,
        improvement_tips: analysis.tips,
        strategic_plan: analysis.strategic_plan,
        performance_score: analysis.performance_score
      })
      .select()
      .single()

    if (analyticsError) throw analyticsError

    // Update match status
    await supabaseClient
      .from('matches')
      .update({ status: 'analyzed' })
      .eq('id', matchId)

    return new Response(
      JSON.stringify({ success: true, analysis: analyticsData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-match:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
