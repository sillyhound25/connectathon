/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 14/03/14
 * Time: 11:59 AM
 * To change this template use File | Settings | File Templates.
 */

var QueryView = Backbone.View.extend({
    events : {

        "click .qry_select_result" : function(ev) {
            //alert('click')
            var inx = $(ev.currentTarget).attr('data-inx');
            this.showResult(inx);
            //alert(inx);
        },

        "click .query_resource" : function(ev) {
            $('.nav-tabs a[href="#qry_tab_params"]').tab('show');
            //select a resource and display the query parameters
            var resourceName = $(ev.currentTarget).attr('data-resource');
            this.resourceName = resourceName;
            var that=this;
            //alert(resourceName);
            $.each(this.model.rest[0].resource,function(inx,res){
                if (res.type === resourceName) {
                    //now get the search params
                    $.get('../templates/conformanceParams.html',function(html){
                        var template = Handlebars.compile(html);
                        //console.log(res.searchParam);

                        //move the common parameter names to the top of the list
                        _.each(['name','identifier'],function(paramName){
                            moveToTop(res,paramName);
                        })


                        $('#query_params').html(template({item:res.searchParam,resourceName:that.resourceName}));
                        return that;
                    })
                }
            })

            //move a particular parameter to the top of the list for the users convenience
            function moveToTop(res,paramName) {
                var pos = -1;
                $.each(res.searchParam,function(inx,sp){
                    if (sp.name === paramName) {
                        pos = inx;
                    }
                })
                if (pos > 0){
                    var param = res.searchParam[pos];
                    res.searchParam.splice(pos,1);
                    res.searchParam.splice(0,0,param);
                }
            }

        },
        "click #query_execute" : function(ev){
            var that = this;
            //clear the display area...
            $('#query_results').html("");
            $('#query_ta').text("");
            $('#qry_result_id').html("");

            //build the query param object
            var query = {resource:this.resourceName,params : []};
            $('.queryParam').each(function(inx,el){
               // console.log(inx,el);
                var v = $(el).val();
                if (v) {
                    var paramName = $(el).attr('data-code');
                    query.params.push({name:paramName,value:v});
                }
            })
            var queryString = JSON.stringify(query);


            console.log(queryString);

            $.get('/api/generalquery?query='+queryString,function(json){
//console.log(json);

                that.resultSet = json;
                //display a list of the responses...
                $.each(json.entry,function(inx,res){
                    var templ = _.template("<li><a class='qry_select_result' data-inx = '<%= inx %>' href='#'>Result # <%= inx %></a></li>");

                    $('#query_results').append(templ({inx:inx}));
                })


                //show the results list
                $('#qry_params_tabview a[href="#qry_tab_results"]').tab('show'); // Select tab by name

                that.showResult(0);
            })


        }
    },

    showResult : function(inx){
        //show a single result from the result set

        if (this.resultSet.entry && this.resultSet.entry.length > inx) {
            var result = this.resultSet.entry[inx].content;
            $('#qry_result_id').html('<strong>' + this.resultSet.entry[inx].id+"</strong>");
            $('#query_ta').text(JSON.stringify(result,undefined,2));
        }



    },


    render : function() {
        var that=this;
        $.get('api/conformance',function(conf){
            that.model = conf;
            //console.log(conf)

            if (conf && conf.rest && conf.rest.length > 0) {

            $.get('../templates/conformanceList.html',function(html){
                var template = Handlebars.compile(html);
                //set the 'common' resources - hard coded for now - possibly from the profiles later...
                var common = ['patient','encounter','medication','medicationprescription','medicationadministration','practitioner'];
                $.each(conf.rest[0].resource,function(inx,res){
                    //console.log(res)
                    if (common.indexOf(res.type.toLowerCase()) > -1) {
                        res.common = true;
                        //console.log(res)
                    }
                })
                that.$el.html(template(conf));
                return that;
            })
            } else {
                alert('The conformance statement from the server was either missing, or described no REST end-points')
            }



        })
    }

});