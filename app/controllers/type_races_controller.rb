class TypeRacesController < ApplicationController

  def index
    # @type_race = TypeRace.last
    # if @type_race.status == "cancel"
    #   @type_race.type_race_stats.destroy_all
    #   @type_race.last.destroy!
    # end
  end

  def show
    #Get template_id same as race_template_id
    if user_logged_in?
      @type_race = TypeRace.find(params[:id])
      @template = RaceTemplate.find_by_id(@type_race.race_templates_id)
    else
      redirect_to type_races_index_path, alert: "Log in to the system"
    end
  end

  def create_or_join
    pending_race = TypeRace.pending.last
    if pending_race
      unless pending_race.user_ids.include?(current_user.id)
        pending_race.users << current_user
      end
      redirect_to type_race_path(pending_race)
    else
      @template = RaceTemplate.last
      @type_race = TypeRace.create(race_templates_id: @template.id, status: "pending", countdown: 10)
      @type_race.users << current_user
      redirect_to type_race_path(@type_race)
    end
  end

  def poll
    @type_race = TypeRace.find(params[:id])
    if @type_race.status == "cancel"
      # @type_race.type_race_stats.destroy_all
      # @type_race.last.destroy!
      redirect_to root_path
    else
       respond_to do |format|
        format.json { render json: { stat: @type_race.type_race_stats, game_stat: @type_race}, status: :ok}
      end
    end
  end

  def update
    @type_race = TypeRace.find(params[:id])
    respond_to do |format|
      if @type_race.update_attributes(status: stat_params[:status], countdown: stat_params[:countdown], start_time: stat_params[:start_time])
        format.json { render json: { game_stat: @type_race}, status: :ok}
      end
      if @type_race.type_race_stats.find_by(user_id: current_user.id).update_attributes(text_area: type_racer_params[:text_area], wpm: type_racer_params[:wpm], accuracy: type_racer_params[:accuracy])
        format.json { render json: { stat: @type_race.type_race_stats}, status: :ok}
      end
    end
  end

  def destroy

  end

  private
  def  type_racer_params
    params.permit(:text_area, :wpm, :accuracy)
  end

  def stat_params
    # params.permit(:status, :count, :countdown, :timer, :get_minutes, :get_seconds)
    params.permit(:status, :countdown, :start_time)
  end
end

